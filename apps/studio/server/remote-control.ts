// Claude Code Remote Control launcher — the seam that makes "Edit in Claude Code" open a BROWSER session
// bound to an ISOLATED checkout of the local Core repository. Studio itself creates a dedicated git
// worktree (a new branch) and runs Remote Control INSIDE it:
//
//   git -C <repo> worktree add -b core-session/<slug> <worktree> HEAD
//   cd <worktree> && claude remote-control --name <name> --spawn same-dir --permission-mode acceptEdits
//
// Because the session's cwd is the worktree, every edit stays on the session's own branch and NEVER touches
// the engineer's working copy of Core. The worktree is a full checkout, so the session has the whole
// repo's context (CLAUDE.md, MCP, skills, SDK, manifests). A per-session brief (CLAUDE.local.md, gitignored)
// tells the session where it came from. Studio opens the browser into it and steps out — it never watches,
// mirrors, or reflects the session's edits back into Studio.
//
// Remote Control needs claude.ai subscription auth (it refuses API-key auth), so we strip ANTHROPIC_API_KEY
// / ANTHROPIC_BASE_URL from the spawn env to use the engineer's subscription.
import {type ChildProcess, execFileSync, spawn} from "node:child_process";
import {randomUUID} from "node:crypto";
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";

import {previewSpec, type PreviewSpec} from "./seeds";

// Scaffold a minimal standalone Vite app that mounts ONLY the template — no navigation shell, no Designers
// Hub — importing the page from SOURCE so the engineer's edits hot-reload. Styling mirrors the repo's proven
// setup (apps/web): tailwind v4 + @corensystem/coren-tokens + @source scanning the component source.
function writePreviewApp(worktree: string, spec: PreviewSpec, port: number): void {
	const dir = join(worktree, ".core-preview");
	mkdirSync(dir, {recursive: true});
	writeFileSync(
		join(dir, "index.html"),
		`<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
		<title>Core preview</title>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/main.tsx"></script>
	</body>
</html>
`,
		"utf8",
	);
	// Styling recipe of apps/web/src/index.css, but from SOURCE (a fresh worktree has no built dist).
	writeFileSync(
		join(dir, "index.css"),
		`@import "../packages/tokens/src/fonts.css";\n@import "../packages/tokens/src/index.css";\n@source "../packages/components/src";\n`,
		"utf8",
	);
	// Mount ONLY the page — from SOURCE, so it hot-reloads and needs no built dist — with the mock data the
	// canonical preview uses. tooltip + mock-data are imported from source for the same reason.
	writeFileSync(
		join(dir, "main.tsx"),
		`import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import "./index.css";
import {TooltipProvider as __WCTP} from "../packages/components/src/tooltip";
import {MOCK_ORGANIZATIONS as __WC_ORGS, getProjectsByOrg as __WC_PROJ} from "../packages/components/src/data/mock-data";
import {${spec.component}} from "${spec.sourceRel}";

const __WC_PROJECT = __WC_ORGS.length ? __WC_PROJ(__WC_ORGS[0].id)[0] : undefined;
void __WC_PROJECT;

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<__WCTP>${spec.render}</__WCTP>
	</StrictMode>,
);
`,
		"utf8",
	);
	writeFileSync(
		join(dir, "vite.config.ts"),
		`import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

// Standalone preview of a single Core template — no nav shell. root is pinned to this file's dir so it
// works no matter what cwd the runner uses (pnpm exec runs from the package root, not this folder).
const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");

export default defineConfig({
	root: here,
	// Templates reference public assets by absolute path (e.g. /images/controlroom.png); serve Studio's public dir.
	publicDir: join(repo, "apps", "studio", "public"),
	server: {port: ${port}, strictPort: true},
	plugins: [react(), tailwindcss()],
	resolve: {
		// Components import @corensystem/coren-utils (→ dist); alias it to SOURCE so a fresh worktree needs no build.
		alias: {"@corensystem/coren-utils": join(repo, "packages", "utils", "src", "index.ts")},
		// Page SOURCE + any package copy can pull two React copies → "Invalid hook call". Force one.
		dedupe: ["react", "react-dom"],
	},
});
`,
		"utf8",
	);
}

// The SessionStart hook fires when the browser connects (it fires in Remote Control sessions). We use it to
// (a) install deps then start the STANDALONE template preview in the background, and (b) inject context so
// the session is fully briefed before the first turn (Claude Code cannot auto-SEND a first message to an RC
// session, so this is the closest supported "auto-start"). Written into the worktree's .claude/
// (settings.local.json is a gitignored local source, so it never pollutes the branch).
function writeSessionEnv(
	worktree: string,
	opts: {spec: PreviewSpec | null; port: number; additionalContext: string; sessionTitle: string},
): void {
	const dotClaude = join(worktree, ".claude");
	mkdirSync(dotClaude, {recursive: true});
	if (opts.spec) writePreviewApp(worktree, opts.spec, opts.port);

	// Mount the Core MCP so the session can actually resolve/reuse templates + widgets (resolve_template,
	// resolve_widgets, list_templates, generate_page_instance, validate_page). Without this the session has no
	// way to reuse Core and will reinvent UI. The worktree is a full checkout, so it has the server.
	writeFileSync(
		join(worktree, ".mcp.json"),
		JSON.stringify(
			{mcpServers: {core: {command: "node", args: [join(worktree, "packages", "mcp", "src", "server.mjs")]}}},
			null,
			2,
		) + "\n",
		"utf8",
	);

	writeFileSync(
		join(dotClaude, "core-session.json"),
		JSON.stringify(
			{
				hookSpecificOutput: {
					hookEventName: "SessionStart",
					additionalContext: opts.additionalContext,
					sessionTitle: opts.sessionTitle,
				},
			},
			null,
			2,
		) + "\n",
		"utf8",
	);
	// Install deps, then (if a preview was scaffolded) start the standalone preview server — all backgrounded
	// so session start never blocks. Then emit the context JSON for Claude.
	// Run vite with an explicit --config (pnpm exec runs from the package root, so a plain \`cd\` is ignored).
	const startPreview = opts.spec
		? `nohup bash -c 'pnpm install && pnpm exec vite --config .core-preview/vite.config.ts' > .claude/wc-preview.log 2>&1 &`
		: `nohup pnpm install > .claude/wc-install.log 2>&1 &`;
	writeFileSync(
		join(dotClaude, "core-session-init.sh"),
		`#!/usr/bin/env bash\n# Core Studio session init — installs deps + starts the standalone preview, briefs the session.\n${startPreview}\ncat .claude/core-session.json\n`,
		"utf8",
	);
	// Auto-approve the project MCP + allow its tools (and the file tools) so the session can reuse Core
	// without an approval prompt. settings.local.json is a gitignored local source; it never touches the branch.
	const CORE_MCP_TOOLS = [
		"mcp__core__list_templates",
		"mcp__core__resolve_template",
		"mcp__core__resolve_widgets",
		"mcp__core__generate_page_instance",
		"mcp__core__validate_page",
	];
	writeFileSync(
		join(dotClaude, "settings.local.json"),
		JSON.stringify(
			{
				enableAllProjectMcpServers: true,
				enabledMcpjsonServers: ["core"],
				permissions: {allow: ["Read", "Edit", "Write", "Glob", "Grep", ...CORE_MCP_TOOLS]},
				hooks: {
					SessionStart: [
						{
							matcher: "startup",
							hooks: [{type: "command", command: "bash .claude/core-session-init.sh", timeout: 20}],
						},
					],
				},
			},
			null,
			2,
		) + "\n",
		"utf8",
	);
}

// A stable-per-session preview port so the injected context can name it (strictPort in the scaffolded config).
function previewPort(id: string): number {
	return 5170 + (parseInt(id.slice(0, 4), 16) % 30);
}

// eslint-disable-next-line no-control-regex
const ANSI = /\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (s: string) => s.replace(ANSI, "");
const RC_URL = /https:\/\/claude\.ai\/code\S*/;
const AUTH_FAIL = /requires claude\.ai|ANTHROPIC_API_KEY is set|not logged in|subscription|log ?in/i;

// Session worktrees live UNDER the repo (in .claude/worktrees, gitignored) so they inherit the repo's
// Claude Code workspace trust — a worktree at an external path would trip the "workspace not trusted" gate.
const sessionsDir = (repoRoot: string) => join(repoRoot, ".claude", "worktrees");

export type SessionResult = {
	launched: boolean;
	url: string | null;
	command: string;
	worktree: string | null;
	branch: string | null;
	error?: string;
};

// One Remote Control server per session (keyed by e.g. templateId), each in its own worktree.
type Session = {key: string; worktree: string; branch: string; url: string; child: ChildProcess};
const sessions = new Map<string, Session>();
const alive = (c: ChildProcess) => c.exitCode === null && !c.killed;

// Kill every Remote Control server (called when Studio's dev server shuts down). Worktrees are left on disk
// so the engineer can reconnect or promote them; discarding them is an explicit action.
export function killAllSessions(): void {
	for (const s of sessions.values()) {
		try {
			s.child.kill();
		} catch {
			// already gone
		}
	}
	sessions.clear();
}

const slugify = (s: string) =>
	s
		.replace(/[^\w.-]+/g, "-")
		.toLowerCase()
		.slice(0, 40) || "session";

// The copyable fallback — the exact commands the engineer can run themselves to open the browser session.
export function sessionCommand(repoRoot: string, worktree: string, branch: string, name: string): string {
	return [
		`git -C ${JSON.stringify(repoRoot)} worktree add -b ${branch} ${JSON.stringify(worktree)} HEAD`,
		`cd ${JSON.stringify(worktree)}`,
		`claude remote-control --name ${JSON.stringify(name)} --spawn same-dir --permission-mode acceptEdits`,
	].join(" && ");
}

// The terminal equivalent — run this in ANY terminal (VS Code's integrated terminal, iTerm, Terminal.app).
// Interactive `claude` fires the same SessionStart hook (starting the standalone preview) and loads the same
// CLAUDE.local.md brief, so the terminal session lands ready exactly like the browser one.
export function terminalCommand(worktree: string): string {
	return `cd ${JSON.stringify(worktree)} && claude`;
}

// Create an isolated worktree off the current repo state, seed it (CLAUDE.local.md brief + SessionStart hook
// that starts a standalone template preview). Returns the worktree/branch/previewUrl, or an error. Shared by
// the browser (Remote Control) and terminal launchers.
type Setup = {worktree: string; branch: string; previewUrl: string | null} | {error: string};
function setupWorktree(opts: {repoRoot: string; key: string; name: string; brief: string; templateId?: string}): Setup {
	const {repoRoot, key, name, brief} = opts;
	const id = randomUUID().slice(0, 8);
	const slug = slugify(key);
	const branch = `core-session/${slug}-${id}`;
	const worktree = join(sessionsDir(repoRoot), `${slug}-${id}`);
	const spec = opts.templateId ? previewSpec(opts.templateId) : null;
	const port = previewPort(id);
	const previewUrl = spec ? `http://localhost:${port}` : null;

	// 1) Create the dedicated worktree (a fresh branch off the current repo state).
	try {
		mkdirSync(sessionsDir(repoRoot), {recursive: true});
		execFileSync("git", ["-C", repoRoot, "worktree", "add", "-b", branch, worktree, "HEAD"], {stdio: "pipe"});
	} catch (e) {
		const msg = e && typeof e === "object" && "stderr" in e ? String((e as {stderr: unknown}).stderr) : String(e);
		return {error: `Couldn't create a git worktree: ${msg.trim()}`};
	}

	// 2) Seed the brief. CLAUDE.local.md is auto-loaded by Claude Code and is gitignored, so it tells the
	//    session where it came from + confirms isolation, without polluting the branch's diff.
	const claudeLocal = `# This editing session

${brief}

## Your isolated workspace
- Directory: \`${worktree}\`
- Branch: \`${branch}\`

You are in a dedicated git worktree. Every edit stays on this branch and must **never** touch the engineer's
main checkout of Core. Do not \`git checkout\` other branches, and do not edit files outside this worktree.

## Core is the source of truth — REUSE before you build (this is mandatory)
This repo IS Core. It has templates, widgets and components for most UI. **Never hand-write a new page or
widget from scratch until you have checked Core first via the \`core\` MCP.** For ANY "add a X / build a
Y" request:
1. Call \`mcp__core__resolve_template\` (e.g. intent "login page") — if a template fits, reuse it.
2. Call \`mcp__core__resolve_widgets\` for the region — reuse composed widgets (DataTable, App Sidebar, …).
3. Otherwise reuse existing components from \`@corensystem/coren-ui/<kebab-name>\` (templates live in
   \`packages/components/src/pages/\`, widgets/components alongside).
4. Only write custom UI when Core genuinely has nothing — and say so in one line, calling it out as new.
Concretely: if asked to "add a login page", first \`resolve_template\` for it and reuse the Core login page
(\`core-login-page\`) — do NOT invent a new one.

## Start here
Confirm your context first: run \`pwd\` and \`git branch --show-current\`, then say one line —
"I'm in an isolated worktree on \`${branch}\`, starting from ${name}." Then use the core MCP as above before editing.
`;
	try {
		writeFileSync(join(worktree, "CLAUDE.local.md"), claudeLocal, "utf8");
	} catch {
		// best-effort — the session still has the full repo context
	}

	// 3) Auto-start: a SessionStart hook installs deps + starts a STANDALONE preview of just this template
	//    (no nav shell) and injects the brief, so the session lands ready with the template already coming up.
	const editFile = spec
		? spec.sourceRel.replace("../", "") + ".tsx"
		: "the template source under packages/components/src/pages/";
	const hookContext = `${brief}

You are in an isolated git worktree — directory \`${worktree}\`, branch \`${branch}\`. Every edit stays on this branch and must NEVER touch the engineer's main Core checkout.

${
	spec
		? `A STANDALONE live preview of ONLY this template — no navigation shell, no Designers Hub — is starting in the background at ${previewUrl} (a fresh worktree installs deps first, usually well under a minute; progress in .claude/wc-preview.log; if the port is busy Vite prints the actual one). It renders the template alone and hot-reloads. Edit \`${editFile}\` and changes appear live. If the preview isn't up yet, wait for the install to finish (\`cat .claude/wc-preview.log\`) — do NOT run \`pnpm dev\` (that starts the whole Designers Hub with its sidebar, which is not what we want).`
		: `Dependencies are installing in the background (usually well under a minute; progress in .claude/wc-install.log).`
}

Core is the source of truth — REUSE before you build. This repo has templates/widgets/components for most UI. For ANY "add/build a X" request, FIRST use the core MCP (\`mcp__core__resolve_template\`, then \`resolve_widgets\`) to find and reuse an existing Core artifact; only write custom UI when nothing fits, and say so. E.g. if asked to add a login page, resolve_template for it and reuse Core's core-login-page — do NOT invent a new one.

Begin by telling the user where you are (worktree + branch), that you're starting from ${name}, and that the standalone preview is coming up${previewUrl ? ` at ${previewUrl}` : ""}.`;
	try {
		writeSessionEnv(worktree, {spec, port, additionalContext: hookContext, sessionTitle: name});
	} catch {
		// best-effort — CLAUDE.local.md still briefs the session
	}

	return {worktree, branch, previewUrl};
}

export type TerminalResult = {
	launched: boolean;
	command: string;
	worktree: string | null;
	branch: string | null;
	previewUrl: string | null;
	error?: string;
};

// Open the workspace in a terminal running interactive `claude`. On macOS we open Terminal.app for the user;
// everywhere (incl. VS Code's integrated terminal) the returned command can be pasted to run it manually.
export function launchTerminalSession(opts: {
	repoRoot: string;
	key: string;
	name: string;
	brief: string;
	templateId?: string;
}): TerminalResult {
	const setup = setupWorktree(opts);
	if ("error" in setup)
		return {launched: false, command: "", worktree: null, branch: null, previewUrl: null, error: setup.error};
	const {worktree, branch, previewUrl} = setup;
	const command = terminalCommand(worktree);

	// A macOS Terminal.app window running `cd <worktree> && claude`. The osascript-escaped shell command.
	if (process.env.CORE_STUDIO_DRY_LAUNCH || process.platform !== "darwin") {
		return {launched: false, command, worktree, branch, previewUrl};
	}
	const shellCmd = `cd ${JSON.stringify(worktree)} && claude`;
	const osa = `tell application "Terminal"\n  do script ${JSON.stringify(shellCmd)}\n  activate\nend tell`;
	try {
		spawn("osascript", ["-e", osa], {detached: true, stdio: "ignore"}).unref();
		return {launched: true, command, worktree, branch, previewUrl};
	} catch {
		return {launched: false, command, worktree, branch, previewUrl};
	}
}

// Create an isolated worktree, seed it, and start Remote Control inside it (browser session). Reuses a live
// session for the same key so repeated clicks don't spawn duplicate worktrees/servers.
export function launchSession(opts: {
	repoRoot: string;
	key: string;
	name: string;
	brief: string;
	templateId?: string;
	timeoutMs?: number;
}): Promise<SessionResult> {
	const {repoRoot, key, name} = opts;

	const existing = sessions.get(key);
	if (existing && alive(existing.child)) {
		return Promise.resolve({
			launched: true,
			url: existing.url,
			command: sessionCommand(repoRoot, existing.worktree, existing.branch, name),
			worktree: existing.worktree,
			branch: existing.branch,
		});
	}
	if (existing) sessions.delete(key);

	const setup = setupWorktree(opts);
	if ("error" in setup) {
		return Promise.resolve({launched: false, url: null, command: "", worktree: null, branch: null, error: setup.error});
	}
	const {worktree, branch} = setup;
	const command = sessionCommand(repoRoot, worktree, branch, name);

	const env = {...process.env};
	delete env.ANTHROPIC_API_KEY;
	delete env.ANTHROPIC_BASE_URL;

	return new Promise((resolve) => {
		let done = false;
		let buf = "";
		const finish = (r: SessionResult) => {
			if (!done) {
				done = true;
				resolve(r);
			}
		};

		let child: ChildProcess;
		try {
			child = spawn(
				"claude",
				["remote-control", "--name", name, "--spawn", "same-dir", "--permission-mode", "acceptEdits"],
				{
					cwd: worktree,
					env,
					detached: true,
					stdio: ["ignore", "pipe", "pipe"],
				},
			);
		} catch (e) {
			return finish({
				launched: false,
				url: null,
				command,
				worktree,
				branch,
				error: e instanceof Error ? e.message : String(e),
			});
		}

		const onData = (d: Buffer) => {
			buf += stripAnsi(d.toString());
			const m = buf.match(RC_URL);
			if (m) {
				sessions.set(key, {key, worktree, branch, url: m[0], child});
				child.on("exit", () => {
					if (sessions.get(key)?.child === child) sessions.delete(key);
				});
				return finish({launched: true, url: m[0], command, worktree, branch});
			}
			if (AUTH_FAIL.test(buf)) {
				const line = buf
					.split("\n")
					.find((l) => AUTH_FAIL.test(l))
					?.trim();
				try {
					child.kill();
				} catch {
					// already gone
				}
				return finish({
					launched: false,
					url: null,
					command,
					worktree,
					branch,
					error: line || "Remote Control needs a Claude subscription login.",
				});
			}
		};
		child.stdout?.on("data", onData);
		child.stderr?.on("data", onData);
		child.on("error", (e) => finish({launched: false, url: null, command, worktree, branch, error: e.message}));
		child.on("exit", (code) =>
			finish({
				launched: false,
				url: null,
				command,
				worktree,
				branch,
				error: `claude exited (${code}) before a session URL appeared.`,
			}),
		);

		setTimeout(() => {
			if (!done) {
				try {
					child.kill();
				} catch {
					// already gone
				}
				finish({
					launched: false,
					url: null,
					command,
					worktree,
					branch,
					error: "Timed out waiting for the Remote Control URL.",
				});
			}
		}, opts.timeoutMs ?? 25000);
	});
}
