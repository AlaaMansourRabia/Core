// Local dev bridge: lets the Storybook chat dock ask the Claude CLI about components.
// The browser can't spawn a CLI, so this tiny server does it — running `claude` headless at the
// repo root (so it has the repo, agent skills, and the Storybook MCP addon) and grounding each
// question with the component's `library-index.json` entry. Dev-only; never ship this.
import {spawn} from "node:child_process";
import {readFileSync} from "node:fs";
import {createServer} from "node:http";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const PORT = Number(process.env.CHAT_BRIDGE_PORT || 47600);
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CLAUDE_TIMEOUT_MS = 90_000;

// Flatten library-index.json into a normalized name -> entry map for grounding.
const norm = (s) =>
	String(s || "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");
let componentsByName = new Map();
try {
	const index = JSON.parse(readFileSync(resolve(REPO_ROOT, "library-index.json"), "utf8"));
	for (const entries of Object.values(index.components ?? {})) {
		for (const entry of entries) {
			componentsByName.set(norm(entry.name), entry);
			if (entry.import) componentsByName.set(norm(entry.import.split("/").pop()), entry);
		}
	}
	console.log(`[chat-bridge] loaded ${componentsByName.size} component entries from library-index.json`);
} catch (err) {
	console.warn(`[chat-bridge] could not read library-index.json (${err.message}); answers will be less grounded`);
}

function findEntry(component, title) {
	return componentsByName.get(norm(component)) || componentsByName.get(norm((title || "").split("/").pop()));
}

function buildPrompts({component, group, title, question}) {
	const entry = findEntry(component, title);
	const system =
		"You are the WakeCore design-system assistant, embedded in the WakeCore Storybook. WakeCore is " +
		"WakeCap's React component library (@wakecap/core-ui). Answer the developer's question about the " +
		"component they are currently viewing. Be concise and specific: name real props, variants, and " +
		"import paths, and give short code examples when useful. If you are unsure, say so briefly rather " +
		"than inventing an API. Keep answers under ~200 words.";
	const user =
		`The developer is viewing the "${component || title}" component` +
		(group ? ` (Storybook group: ${group})` : "") +
		".\n" +
		(entry ? `Its library-index entry:\n\`\`\`json\n${JSON.stringify(entry)}\n\`\`\`\n` : "") +
		`\nQuestion: ${question}`;
	return {system, user, grounded: Boolean(entry)};
}

function runClaude({system, user}) {
	return new Promise((resolvePromise) => {
		const args = [
			"-p",
			user,
			"--append-system-prompt",
			system,
			"--output-format",
			"json",
			"--allowedTools",
			"Read Grep Glob",
			"--disallowedTools",
			"Bash Write Edit MultiEdit NotebookEdit",
		];
		const child = spawn("claude", args, {cwd: REPO_ROOT});
		let stdout = "";
		let stderr = "";
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			resolvePromise({ok: false, error: "The Claude CLI took too long (>90s) and was stopped."});
		}, CLAUDE_TIMEOUT_MS);

		child.stdout.on("data", (d) => (stdout += d));
		child.stderr.on("data", (d) => (stderr += d));
		child.on("error", (err) => {
			clearTimeout(timer);
			resolvePromise({
				ok: false,
				error:
					err.code === "ENOENT"
						? "The `claude` CLI was not found on PATH. Install Claude Code and run `claude login`."
						: `Failed to run the Claude CLI: ${err.message}`,
			});
		});
		child.on("close", (code) => {
			clearTimeout(timer);
			if (code !== 0 && !stdout) {
				resolvePromise({ok: false, error: stderr.trim() || `Claude CLI exited with code ${code}.`});
				return;
			}
			try {
				const parsed = JSON.parse(stdout);
				const answer = parsed.result ?? parsed.text ?? stdout;
				resolvePromise({
					ok: !parsed.is_error,
					answer: String(answer).trim(),
					error: parsed.is_error ? answer : undefined,
				});
			} catch {
				resolvePromise({ok: true, answer: stdout.trim()});
			}
		});
	});
}

const cors = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

const server = createServer((req, res) => {
	if (req.method === "OPTIONS") {
		res.writeHead(204, cors);
		res.end();
		return;
	}
	if (req.method === "GET" && req.url === "/health") {
		res.writeHead(200, {...cors, "Content-Type": "application/json"});
		res.end(JSON.stringify({ok: true, components: componentsByName.size}));
		return;
	}
	if (req.method === "POST" && req.url === "/ask") {
		let body = "";
		req.on("data", (c) => (body += c));
		req.on("end", async () => {
			let payload;
			try {
				payload = JSON.parse(body || "{}");
			} catch {
				res.writeHead(400, {...cors, "Content-Type": "application/json"});
				res.end(JSON.stringify({error: "Invalid JSON body."}));
				return;
			}
			if (!payload.question || !String(payload.question).trim()) {
				res.writeHead(400, {...cors, "Content-Type": "application/json"});
				res.end(JSON.stringify({error: "Missing 'question'."}));
				return;
			}
			const {system, user, grounded} = buildPrompts(payload);
			console.log(`[chat-bridge] ask about "${payload.component || payload.title}" (grounded: ${grounded})`);
			const result = await runClaude({system, user});
			res.writeHead(result.ok ? 200 : 502, {...cors, "Content-Type": "application/json"});
			res.end(JSON.stringify(result.ok ? {answer: result.answer, grounded} : {error: result.error}));
		});
		return;
	}
	res.writeHead(404, cors);
	res.end();
});

server.listen(PORT, () => {
	console.log(`[chat-bridge] listening on http://localhost:${PORT} (repo root: ${REPO_ROOT})`);
	console.log("[chat-bridge] POST /ask {component, group, title, question}  ·  GET /health");
});
