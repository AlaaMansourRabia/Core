// Client side of the workspace/launch seam. Studio materializes an external workspace on Edit and launches
// an editor into it, then steps out — it does not watch or preview the workspace. Recent workspaces are for
// reopening/relaunching only; they never render workspace changes.

export type EditorInfo = {id: string; label: string; available: boolean};
export type LaunchTarget = "browser" | "terminal" | "app";
export type LaunchResult = {launched: boolean; command: string; target: LaunchTarget};

export type RecentWorkspace = {
	id: string;
	name: string;
	template: {id: string; version: string};
	path: string;
	editor: string;
	created: string;
	lastOpened: string;
	exists: boolean;
	lastModified: string | null;
	branch: string | null;
};

export type PromoteSteps = {hasGit: boolean; steps: string[]; note: string};

async function getJson<T>(url: string): Promise<T> {
	const res = await fetch(url);
	const data = await res.json();
	if (!res.ok) throw new Error((data as {error?: string}).error || `${url} ${res.status}`);
	return data as T;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
	const res = await fetch(url, {
		method: "POST",
		headers: {"content-type": "application/json"},
		body: JSON.stringify(body),
	});
	const data = await res.json();
	if (!res.ok) throw new Error((data as {error?: string}).error || `${url} ${res.status}`);
	return data as T;
}

export function listEditors(): Promise<EditorInfo[]> {
	return getJson<{editors: EditorInfo[]}>("/api/editors").then((r) => r.editors);
}

export function suggestLocation(templateId: string): Promise<string> {
	return getJson<{location: string}>(
		`/api/workspace/suggest-location?templateId=${encodeURIComponent(templateId)}`,
	).then((r) => r.location);
}

export function listRecentWorkspaces(): Promise<RecentWorkspace[]> {
	return getJson<{workspaces: RecentWorkspace[]}>("/api/workspaces").then((r) => r.workspaces);
}

export type MaterializeResult = {
	workspace: {id: string; name: string; path: string; template: {id: string; version: string}; created: string};
	editor: {id: string; label: string};
	launch: LaunchResult;
};

export function materializeWorkspace(input: {
	templateId: string;
	location: string;
	editorId?: string;
	prompt?: string;
}): Promise<MaterializeResult> {
	return postJson<MaterializeResult>("/api/workspace/materialize", input);
}

export function relaunchWorkspace(input: {
	path: string;
	editorId?: string;
	prompt?: string;
}): Promise<{editor: {id: string; label: string}; launch: LaunchResult}> {
	return postJson("/api/editor/launch", input);
}

export function promoteWorkspace(input: {path: string; name?: string}): Promise<PromoteSteps> {
	const q = new URLSearchParams({path: input.path, ...(input.name ? {name: input.name} : {})});
	return getJson<PromoteSteps>(`/api/workspace/promote?${q.toString()}`);
}

// A Claude Code session bound to an isolated worktree of the local WakeCore repo. mode "browser" → Remote
// Control (a claude.ai/code URL); mode "terminal" → interactive `claude` in a terminal (+ copyable command).
export type SessionMode = "browser" | "terminal";
export type SessionResult = {
	editor: {id: string; label: string};
	launch: {launched: boolean; url: string | null; command: string; target: SessionMode; previewUrl?: string | null};
	worktree: string | null;
	branch: string | null;
	error?: string;
	brief: string;
};

export function openClaudeSession(input: {
	templateId?: string;
	blank?: boolean;
	mode?: SessionMode;
}): Promise<SessionResult> {
	return postJson<SessionResult>("/api/editor/session", input);
}
