// Drive Open Design end-to-end via its daemon API, forcing the wakecore-compose skill so the run is
// constrained to WakeCore. Creates a project, starts a run on the local `claude` agent, polls to
// completion, and reports the artifacts produced.
import {randomUUID} from "node:crypto";

const D = process.env.OD_DAEMON || "http://127.0.0.1:52319";
const PROMPT = process.argv[2] || "an operations dashboard";

const j = async (path, opts) => {
	const res = await fetch(D + path, opts);
	const text = await res.text();
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		body = text;
	}
	return {status: res.status, body};
};

// 1) create a project (also creates a conversation)
const projId = randomUUID();
const create = await j("/api/projects", {
	method: "POST",
	headers: {"content-type": "application/json"},
	body: JSON.stringify({id: projId, name: "WakeCore × Open Design", designSystemId: null}),
});
console.log("create project:", create.status, typeof create.body === "object" ? JSON.stringify(Object.keys(create.body)) : create.body);
if (create.status >= 400) process.exit(1);
const project = create.body.project ?? create.body;
const conversationId = create.body.conversationId ?? null;
console.log("projectId:", project.id, "conversationId:", conversationId);

// 2) start a run, forcing the WakeCore skill + local claude agent
const run = await j("/api/runs", {
	method: "POST",
	headers: {"content-type": "application/json", "X-OD-Client": "web"},
	body: JSON.stringify({
		projectId: project.id,
		conversationId,
		agentId: "claude",
		message: PROMPT,
		skillId: "wakecore-compose",
		skillIds: ["wakecore-compose"],
		designSystemId: null,
	}),
});
console.log("create run:", run.status, JSON.stringify(run.body).slice(0, 300));
if (run.status >= 400) process.exit(1);
const runId = run.body.runId ?? run.body.id;
console.log("runId:", runId);

// 3) poll to completion
const TERMINAL = new Set(["completed", "succeeded", "failed", "error", "cancelled", "done"]);
const start = Date.now();
let last = "";
while (Date.now() - start < 6 * 60 * 1000) {
	await new Promise((r) => setTimeout(r, 3000));
	const st = await j(`/api/runs/${runId}`, {});
	const status = st.body?.status ?? st.body?.run?.status ?? "?";
	const events = st.body?.events ?? st.body?.run?.events ?? [];
	const tail = events.length ? JSON.stringify(events[events.length - 1]).slice(0, 160) : "";
	const line = `[${Math.round((Date.now() - start) / 1000)}s] status=${status} events=${events.length}`;
	if (line !== last) {
		console.log(line, tail);
		last = line;
	}
	if (TERMINAL.has(String(status))) break;
}

// 4) list artifacts
const files = await j(`/api/projects/${project.id}/files`, {});
const list = Array.isArray(files.body) ? files.body : files.body?.files ?? [];
console.log("FILES:", JSON.stringify(list.map((f) => (typeof f === "string" ? f : f.name || f.path)).slice(0, 20)));
console.log("PROJECT_ID=" + project.id);
console.log("RUN_ID=" + runId);
