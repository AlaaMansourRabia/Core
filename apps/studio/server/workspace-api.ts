import type {Connect, Plugin} from "vite";

// The workspace/launch seam (Phase 4). These endpoints run on Studio's LOCAL Node backend — Studio is a
// local tool (a hosted Studio couldn't open a terminal). The flow is a one-way handoff: materialize a
// workspace, project the editor's config, launch the editor, record it in Recent — then Studio returns to
// the canonical Preview. No watcher, no iframe, no refresh-on-edit.
//
//   GET  /api/editors                    → [{id,label,available}]
//   GET  /api/workspaces                 → recent workspaces (reopen/relaunch only)
//   GET  /api/workspace/suggest-location → a non-colliding default path for a template
//   GET  /api/workspace/promote          → copyable, NON-DESTRUCTIVE steps to turn a workspace into a PR
//   POST /api/editor/session             → launch a browser Claude Code session bound to the local repo
//   POST /api/workspace/materialize      → materialize + prepare + launch + record → {workspace, launch}
//   POST /api/editor/launch              → prepare + launch an existing workspace + touch → {launch}
import {spawn} from "node:child_process";
import {existsSync} from "node:fs";
import {homedir} from "node:os";
import {basename, dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {getEditor, listEditors} from "./editors";
import {killAllSessions, launchSession, launchTerminalSession} from "./remote-control";
import {addRecent, listRecent, materializeWorkspace, touchRecent} from "./workspace";

// The local WakeCore repository — the source of truth an editing session starts from.
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// Open a URL in the default browser (macOS). Best-effort; the URL is always returned for manual opening.
function openBrowser(url: string): void {
	try {
		if (process.platform === "darwin") spawn("open", [url], {detached: true, stdio: "ignore"}).unref();
	} catch {
		// caller still gets the URL to open manually
	}
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		let d = "";
		req.on("data", (c) => (d += c));
		req.on("end", () => resolve(d));
		req.on("error", reject);
	});
}
function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown) {
	res.statusCode = status;
	res.setHeader("content-type", "application/json");
	res.end(JSON.stringify(body));
}

// A sensible default workspace location: ~/wakecore-workspaces/<templateId>, suffixed if it already exists.
function suggestLocation(templateId: string): string {
	const base = join(homedir(), "wakecore-workspaces");
	const slug = templateId.replace(/[^\w.-]+/g, "-");
	let candidate = join(base, slug);
	for (let i = 2; existsSync(candidate); i++) candidate = join(base, `${slug}-${i}`);
	return candidate;
}

// Copyable, NON-DESTRUCTIVE steps to turn a workspace into a PR. Studio never runs mutating git here — it
// hands the user the exact commands (tailored to whether the folder is already a git repo). The workspace
// is an external proposal; promotion is the normal contribution flow (commit → branch → push → PR).
function promoteSteps(path: string, name?: string): {hasGit: boolean; steps: string[]; note: string} {
	const hasGit = existsSync(join(path, ".git"));
	const label = (name ?? basename(path)).replace(/[^\w.-]+/g, "-").toLowerCase();
	const steps = [
		`cd "${path}"`,
		...(hasGit ? [] : ["git init"]),
		`git checkout -b wakecore/${label}`,
		"git add -A",
		`git commit -m "feat: ${label} — edited from WakeCore Studio"`,
		"git push -u <your-fork-remote> HEAD",
		"gh pr create --repo wakecap/Wakecore --fill",
	];
	return {
		hasGit,
		steps,
		note: "Push to your fork of wakecap/Wakecore, then open a PR. Your changes reach Studio only after they're reviewed and merged.",
	};
}

export function studioWorkspace(): Plugin {
	return {
		name: "wakecore-studio-workspace",
		configureServer(server) {
			// Tear down Remote Control servers when Studio's dev server stops or the process exits.
			server.httpServer?.once("close", killAllSessions);
			process.once("exit", killAllSessions);
			server.middlewares.use("/api/editors", (_req, res) => {
				sendJson(res, 200, {editors: listEditors()});
			});

			server.middlewares.use("/api/workspaces", (_req, res) => {
				sendJson(res, 200, {workspaces: listRecent()});
			});

			server.middlewares.use("/api/workspace/suggest-location", (req, res) => {
				const url = new URL(req.url ?? "", "http://localhost");
				const templateId = url.searchParams.get("templateId") ?? "workspace";
				sendJson(res, 200, {location: suggestLocation(templateId)});
			});

			// Launch a Claude Code session bound to an ISOLATED worktree of the local WakeCore repo. Two modes:
			//   "browser"  — Remote Control inside the worktree → a claude.ai/code URL we open in the browser.
			//   "terminal" — interactive `claude` in the worktree → a Terminal.app window (macOS) + a copyable
			//                 `cd <worktree> && claude` command that runs in ANY terminal (incl. VS Code).
			// Either way the session inherits the repo's CLAUDE.md, MCP, skills, SDK + a CLAUDE.local.md brief,
			// and a SessionStart hook starts a standalone preview of just the template. Edits stay on the
			// session's branch and never touch the engineer's working copy.
			server.middlewares.use("/api/editor/session", async (req, res) => {
				if (req.method !== "POST") return sendJson(res, 405, {error: "POST only"});
				try {
					const body = JSON.parse((await readBody(req)) || "{}") as {
						templateId?: string;
						blank?: boolean;
						mode?: "browser" | "terminal";
					};
					const name = body.blank ? "WakeCore · new interface" : `WakeCore · ${body.templateId ?? "template"}`;
					const brief = body.blank
						? "You are creating a brand-new WakeCore interface in an isolated worktree. Before creating UI, inspect templates, widgets, components, the SDK and the WakeCore MCP (resolve_template → resolve_widgets → validate_page). Reuse WakeCore first; only generate custom UI as a last resort. Your edits stay on this session's branch."
						: `You are editing WakeCore starting from the "${body.templateId ?? "template"}" template, in an isolated worktree. Start by inspecting the template source + its manifest and the related widgets/components via the WakeCore MCP; reuse WakeCore first, only generate custom UI when nothing fits. Your edits stay on this session's branch and never touch the original template.`;
					const shared = {
						repoRoot: REPO_ROOT,
						key: body.blank ? `new-${Date.now()}` : (body.templateId ?? "template"),
						name,
						brief,
						templateId: body.blank ? undefined : body.templateId,
					};

					if (body.mode === "terminal") {
						const t = launchTerminalSession(shared);
						return sendJson(res, 200, {
							editor: {id: "claude", label: "Claude Code"},
							launch: {
								launched: t.launched,
								url: null,
								command: t.command,
								target: "terminal",
								previewUrl: t.previewUrl,
							},
							worktree: t.worktree,
							branch: t.branch,
							error: t.error,
							brief,
						});
					}

					const s = await launchSession(shared);
					if (s.launched && s.url) openBrowser(s.url);
					sendJson(res, 200, {
						editor: {id: "claude", label: "Claude Code"},
						launch: {launched: s.launched, url: s.url, command: s.command, target: "browser"},
						worktree: s.worktree,
						branch: s.branch,
						error: s.error,
						brief,
					});
				} catch (e) {
					sendJson(res, 500, {error: e instanceof Error ? e.message : String(e)});
				}
			});

			// Non-destructive: return the commands to promote a workspace to a PR. Studio runs nothing here.
			server.middlewares.use("/api/workspace/promote", (req, res) => {
				const url = new URL(req.url ?? "", "http://localhost");
				const path = url.searchParams.get("path");
				if (!path) return sendJson(res, 400, {error: "Missing path."});
				sendJson(res, 200, promoteSteps(path, url.searchParams.get("name") ?? undefined));
			});

			// Materialize a workspace, project the chosen editor's config, launch it, and record it.
			server.middlewares.use("/api/workspace/materialize", async (req, res) => {
				if (req.method !== "POST") return sendJson(res, 405, {error: "POST only"});
				try {
					const body = JSON.parse((await readBody(req)) || "{}") as {
						templateId?: string;
						location?: string;
						editorId?: string;
						prompt?: string;
					};
					if (!body.templateId) throw new Error("Missing templateId.");
					const location = body.location?.trim() || suggestLocation(body.templateId);

					const workspace = materializeWorkspace({templateId: body.templateId, location});
					const editor = getEditor(body.editorId);
					editor.prepare(location); // project .wakecore/ into this editor's config
					const launch = editor.launch(location, body.prompt);
					addRecent({
						id: workspace.id,
						name: workspace.name,
						template: workspace.template,
						path: workspace.path,
						editor: editor.id,
						created: workspace.created,
						lastOpened: new Date().toISOString(),
					});
					sendJson(res, 200, {workspace, editor: {id: editor.id, label: editor.label}, launch});
				} catch (e) {
					sendJson(res, 400, {error: e instanceof Error ? e.message : String(e)});
				}
			});

			// Relaunch an existing workspace from the Recent list (re-prepare in case config drifted).
			server.middlewares.use("/api/editor/launch", async (req, res) => {
				if (req.method !== "POST") return sendJson(res, 405, {error: "POST only"});
				try {
					const body = JSON.parse((await readBody(req)) || "{}") as {path?: string; editorId?: string; prompt?: string};
					const path = body.path?.trim();
					if (!path) throw new Error("Missing path.");
					if (!existsSync(path)) throw new Error(`Workspace no longer exists at "${path}".`);
					const editor = getEditor(body.editorId);
					editor.prepare(path);
					const launch = editor.launch(path, body.prompt);
					touchRecent(path, editor.id);
					sendJson(res, 200, {editor: {id: editor.id, label: editor.label}, launch});
				} catch (e) {
					sendJson(res, 400, {error: e instanceof Error ? e.message : String(e)});
				}
			});
		},
	};
}
