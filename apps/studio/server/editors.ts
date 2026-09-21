// The Editor abstraction (Phase 4, extended in Phase 6). Studio never names an editor in its core — it
// depends on this interface. `.core/` is the single canonical source; each Editor.prepare() PROJECTS
// it into that editor's expected config, and launch() opens the editor on the workspace (optionally with a
// starting prompt). New editors are added here without changing the workspace schema. All OS-specific
// terminal handling lives inside the Editor implementation. isAvailable() gates the launch button; when the
// tool isn't on PATH the caller falls back to a copyable command — never a hard failure.
import {spawn} from "node:child_process";
import {existsSync, mkdirSync, writeFileSync} from "node:fs";
import {delimiter, dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

export type LaunchTarget = "browser" | "terminal" | "app";
export type LaunchResult = {launched: boolean; command: string; target: LaunchTarget};

export interface Editor {
	id: string;
	label: string;
	isAvailable(): boolean;
	prepare(location: string): void; // project .core/ into THIS editor's config (idempotent)
	launch(location: string, prompt?: string): LaunchResult; // open the editor on the workspace
}

// The read-only Core MCP editors consult before editing. It runs as a stdio server FROM THE MONOREPO
// but exposes only advisory + validation tools — it can never write into the workspace.
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CORE_MCP_SERVER = join(REPO_ROOT, "packages", "mcp", "src", "server.mjs");
const CORE_MCP_TOOLS = [
	"mcp__core__list_templates",
	"mcp__core__resolve_template",
	"mcp__core__resolve_widgets",
	"mcp__core__generate_page_instance",
	"mcp__core__validate_page",
];
const MCP_CONFIG = {mcpServers: {core: {command: "node", args: [CORE_MCP_SERVER]}}};

// Small & STABLE policy shared across editors. The DATA lives in .core/; these INSTRUCTIONS stay
// generic and are never regenerated. Each editor writes it into its own expected file/format.
const CORE_POLICY = `This is a single-page app materialized from a canonical Core template. Core is the source of
truth — **reuse before you build.**

- The editable page is \`src/page.tsx\` (keep a \`export default function Page()\`). You own it.
- \`.core/\` is your Core context: \`template.json\` (the source manifest), \`page-instance.json\`
  (the composition seed + validation target), \`workspace.json\` (envelope). Treat it as advisory — it may
  drift from the code; never hand-edit it.
- Consult Core via the **core MCP** before adding UI: \`resolve_template\`, then \`resolve_widgets\`
  for the region, then \`validate_page\`. Only write custom code when nothing fits — and say so.
- Import every Core artifact from \`@core/core-ui/<kebab-name>\` (e.g. \`@core/core-ui/data-table\`).
  Derive the path from the name; never search node_modules.

Editing happens here, in your editor. It reaches Core Studio only after it is reviewed and merged.`;

// --- helpers ------------------------------------------------------------------------------------------

// Resolve an executable on PATH (plus ~/.local/bin and an optional override). Returns the path or null.
function onPath(bin: string, override?: string): string | null {
	if (override && existsSync(override)) return override;
	const dirs = (process.env.PATH ?? "").split(delimiter);
	const extra = process.env.HOME ? [join(process.env.HOME, ".local", "bin")] : [];
	for (const d of [...dirs, ...extra]) {
		if (!d) continue;
		const p = join(d, bin);
		if (existsSync(p)) return p;
	}
	return null;
}

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

// Shell single-quote (safe for spaces/specials) and AppleScript double-quote escaping.
const shq = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
const asq = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// A CLI invocation with an optional starting prompt, e.g. `claude "add a footer"`.
function cliInvocation(cli: string, prompt?: string): string {
	const p = prompt?.trim();
	return p ? `${cli} ${shq(p)}` : cli;
}

// Open a macOS Terminal running a shell command in the workspace. Returns whether it actually launched.
function openTerminalMac(location: string, invocation: string): boolean {
	const shellCmd = `cd ${shq(location)} && ${invocation}`;
	const osa = `tell application "Terminal"\n  do script "${asq(shellCmd)}"\n  activate\nend tell`;
	try {
		spawn("osascript", ["-e", osa], {detached: true, stdio: "ignore"}).unref();
		return true;
	} catch {
		return false;
	}
}

// A terminal-CLI editor (Codex / Gemini): launch opens a Terminal that runs the CLI in the ws.
function terminalLaunch(editor: Editor, cli: string, location: string, prompt?: string): LaunchResult {
	const invocation = cliInvocation(cli, prompt);
	const command = `cd "${location}" && ${invocation}`; // copyable fallback (always returned)
	const target = "terminal" as const;
	if (process.env.CORE_STUDIO_DRY_LAUNCH) return {launched: false, command, target};
	if (!editor.isAvailable()) return {launched: false, command, target};
	if (process.platform === "darwin") return {launched: openTerminalMac(location, invocation), command, target};
	return {launched: false, command, target}; // other platforms: hand back the copyable command
}

// A GUI-app editor (Cursor): launch opens the app on the folder. Prompt isn't passed through a CLI.
function appLaunch(editor: Editor, bin: string, location: string): LaunchResult {
	const command = `${bin} "${location}"`;
	const target = "app" as const;
	if (process.env.CORE_STUDIO_DRY_LAUNCH) return {launched: false, command, target};
	if (!editor.isAvailable()) return {launched: false, command, target};
	try {
		spawn(bin, [location], {detached: true, stdio: "ignore"}).unref();
		return {launched: true, command, target};
	} catch {
		return {launched: false, command, target};
	}
}

// Open a URL in the default browser (macOS `open`). Returns whether it launched.
function openBrowserMac(url: string): boolean {
	try {
		spawn("open", [url], {detached: true, stdio: "ignore"}).unref();
		return true;
	} catch {
		return false;
	}
}

// A browser editor: launch opens a web IDE in the default browser (no local terminal). The web app runs on
// its own cloud/GitHub environment, so it does not read the local workspace files — Studio still materializes
// them so `cd <ws> && <cli>` works if the user prefers running the CLI locally.
function browserLaunch(url: string): LaunchResult {
	const target = "browser" as const;
	if (process.env.CORE_STUDIO_DRY_LAUNCH) return {launched: false, command: url, target};
	if (process.platform === "darwin") return {launched: openBrowserMac(url), command: url, target};
	return {launched: false, command: url, target};
}

// --- editors ------------------------------------------------------------------------------------------

// Claude Code opens in the browser (claude.ai/code). A browser is always available, so isAvailable() is
// true. prepare() still writes the local Claude config so `cd <ws> && claude` works if run manually.
const CLAUDE_WEB_URL = "https://claude.ai/code";
const claudeEditor: Editor = {
	id: "claude",
	label: "Claude Code",
	isAvailable() {
		return true;
	},
	prepare(location) {
		writeFileSync(join(location, "CLAUDE.md"), `# Core workspace\n\n${CORE_POLICY}\n`, "utf8");
		writeJson(join(location, ".mcp.json"), MCP_CONFIG);
		mkdirSync(join(location, ".claude"), {recursive: true});
		writeJson(join(location, ".claude", "settings.json"), {
			permissions: {allow: ["Read", "Edit", "Write", "Glob", "Grep", ...CORE_MCP_TOOLS], deny: ["Bash", "Task"]},
		});
	},
	launch() {
		return browserLaunch(CLAUDE_WEB_URL);
	},
};

const cursorEditor: Editor = {
	id: "cursor",
	label: "Cursor",
	isAvailable() {
		return onPath("cursor") !== null;
	},
	prepare(location) {
		const rulesDir = join(location, ".cursor", "rules");
		mkdirSync(rulesDir, {recursive: true});
		writeFileSync(
			join(rulesDir, "core.mdc"),
			`---\ndescription: Core workspace rules\nalwaysApply: true\n---\n\n${CORE_POLICY}\n`,
			"utf8",
		);
		writeJson(join(location, ".cursor", "mcp.json"), MCP_CONFIG);
	},
	launch(location) {
		return appLaunch(this, "cursor", location);
	},
};

const codexEditor: Editor = {
	id: "codex",
	label: "Codex",
	isAvailable() {
		return onPath("codex") !== null;
	},
	// AGENTS.md (Codex's convention) is the cross-editor policy already written by the materializer, so
	// there is nothing editor-specific to project here.
	prepare() {},
	launch(location, prompt) {
		return terminalLaunch(this, "codex", location, prompt);
	},
};

const geminiEditor: Editor = {
	id: "gemini",
	label: "Gemini CLI",
	isAvailable() {
		return onPath("gemini") !== null;
	},
	prepare(location) {
		writeFileSync(join(location, "GEMINI.md"), `# Core workspace\n\n${CORE_POLICY}\n`, "utf8");
		mkdirSync(join(location, ".gemini"), {recursive: true});
		writeJson(join(location, ".gemini", "settings.json"), {mcpServers: MCP_CONFIG.mcpServers});
	},
	launch(location, prompt) {
		return terminalLaunch(this, "gemini", location, prompt);
	},
};

const REGISTRY: Editor[] = [claudeEditor, cursorEditor, codexEditor, geminiEditor];

export function listEditors(): Array<{id: string; label: string; available: boolean}> {
	return REGISTRY.map((e) => ({id: e.id, label: e.label, available: e.isAvailable()}));
}

// Resolve an editor by id; defaults to the first registered editor (Claude) when unknown/omitted.
export function getEditor(id?: string): Editor {
	return REGISTRY.find((e) => e.id === id) ?? REGISTRY[0];
}
