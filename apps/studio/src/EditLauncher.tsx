import {Input} from "@corensystem/core-ui/input";
import {Check, Copy, ExternalLink, GitBranch, Loader2, SquareArrowOutUpRight, TriangleAlert} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {
	listEditors,
	materializeWorkspace,
	openClaudeSession,
	suggestLocation,
	type EditorInfo,
	type LaunchResult,
	type MaterializeResult,
	type SessionMode,
	type SessionResult,
} from "./lib/workspace";

// How a materialized (local-editor) workspace opened — phrased per launch target.
function launchMessage(label: string, launch: LaunchResult): string {
	if (launch.launched) {
		if (launch.target === "terminal") return `Launched ${label} in a new terminal.`;
		return `Opened ${label}.`;
	}
	return `${label} isn't available — run this to open it:`;
}

// The Edit launcher. For Claude Code, Studio opens a BROWSER Remote Control session bound to the local
// Core repo (isolated git worktree) — the session already has the template + Core knowledge (MCP,
// SDK, skills, CLAUDE.md) from the repo itself. For other editors it materializes a local workspace. Either
// way Studio only prepares + launches, then steps out — it never watches or previews the editing session.
export function EditLauncher({templateId}: {templateId: string}) {
	const [open, setOpen] = useState(false);
	const [editors, setEditors] = useState<EditorInfo[] | null>(null);
	const [editorId, setEditorId] = useState("claude");
	const [mode, setMode] = useState<SessionMode>("browser"); // Claude only: open in browser or a terminal
	const [location, setLocation] = useState("");
	const [prompt, setPrompt] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [session, setSession] = useState<SessionResult | null>(null); // Claude (browser) result
	const [result, setResult] = useState<MaterializeResult | null>(null); // other editors (local) result
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	const isClaude = editorId === "claude";

	useEffect(() => {
		if (!open || editors) return;
		listEditors()
			.then(setEditors)
			.catch((e) => setError(String(e)));
		suggestLocation(templateId)
			.then(setLocation)
			.catch(() => {});
	}, [open, editors, templateId]);

	useEffect(() => {
		if (!open) return;
		function onDown(e: MouseEvent) {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", onDown);
		return () => document.removeEventListener("mousedown", onDown);
	}, [open]);

	const editor = editors?.find((e) => e.id === editorId);
	const done = session || result;

	const reset = () => {
		setSession(null);
		setResult(null);
		setError(null);
	};

	const submit = async () => {
		if (submitting) return;
		if (!isClaude && !location.trim()) return;
		setSubmitting(true);
		reset();
		try {
			if (isClaude) setSession(await openClaudeSession({templateId, mode}));
			else
				setResult(
					await materializeWorkspace({
						templateId,
						location: location.trim(),
						editorId,
						prompt: prompt.trim() || undefined,
					}),
				);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSubmitting(false);
		}
	};

	const copy = (text: string) => {
		void navigator.clipboard?.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	// A copyable command / URL row (used for fallbacks).
	const commandRow = (text: string) => (
		<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/50 wwc:p-2">
			<code className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-xs">{text}</code>
			<button
				onClick={() => copy(text)}
				className="wwc:inline-flex wwc:shrink-0 wwc:items-center wwc:gap-1 wwc:rounded wwc:border wwc:border-border wwc:px-1.5 wwc:py-0.5 wwc:text-[11px] wwc:text-muted-foreground wwc:hover:bg-muted"
			>
				{copied ? <Check className="wwc:size-3" /> : <Copy className="wwc:size-3" />}
				{copied ? "Copied" : "Copy"}
			</button>
		</div>
	);

	return (
		<div className="wwc:relative" ref={panelRef}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:bg-primary wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-primary-foreground wwc:hover:opacity-90"
			>
				<SquareArrowOutUpRight className="wwc:size-3.5" />
				Build with
			</button>

			{open && (
				<div className="wwc:absolute wwc:right-0 wwc:z-20 wwc:mt-2 wwc:w-[440px] wwc:max-w-[92vw] wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-4 wwc:shadow-lg">
					{!done ? (
						<>
							<div className="wwc:text-sm wwc:font-semibold">Build from this template</div>
							<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
								{isClaude
									? mode === "browser"
										? "Opens Claude Code in your browser, in an isolated copy of Core that already knows this template. Your edits stay on their own branch."
										: "Opens Claude Code in a terminal (VS Code too), in an isolated copy of Core that already knows this template."
									: "Creates a separate workspace and opens it in your editor. Changes appear in Studio only after review and merge."}
							</p>

							{/* Editor picker */}
							<div className="wwc:mt-3">
								<div className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
									Editor
								</div>
								<div className="wwc:mt-1 wwc:flex wwc:flex-wrap wwc:gap-1.5">
									{(editors ?? []).map((e) => {
										// Only Claude is wired to the session flow today; the rest are coming soon.
										const comingSoon = e.id !== "claude";
										return (
											<button
												key={e.id}
												onClick={() => !comingSoon && setEditorId(e.id)}
												disabled={comingSoon}
												title={comingSoon ? "Coming soon" : "Build from this template with Claude Code"}
												className={`wwc:rounded-md wwc:border wwc:px-2 wwc:py-1 wwc:text-xs ${
													e.id === editorId
														? "wwc:border-primary wwc:bg-primary/10 wwc:text-foreground"
														: "wwc:border-border wwc:text-muted-foreground wwc:hover:bg-muted"
												} ${comingSoon ? "wwc:cursor-not-allowed wwc:opacity-50 wwc:hover:bg-transparent" : ""}`}
											>
												{e.label}
												{comingSoon && " · Coming soon"}
											</button>
										);
									})}
								</div>
							</div>

							{/* Claude-only: open in browser or a terminal */}
							{isClaude && (
								<div className="wwc:mt-3">
									<div className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
										Open in
									</div>
									<div className="wwc:mt-1 wwc:inline-flex wwc:rounded-md wwc:border wwc:border-border wwc:p-0.5 wwc:text-xs">
										{(["browser", "terminal"] as const).map((m) => (
											<button
												key={m}
												onClick={() => setMode(m)}
												className={`wwc:rounded wwc:px-2.5 wwc:py-1 wwc:capitalize ${mode === m ? "wwc:bg-primary wwc:text-primary-foreground" : "wwc:text-muted-foreground wwc:hover:bg-muted"}`}
											>
												{m}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Local-editor-only fields: location + starting prompt */}
							{!isClaude && (
								<>
									{editor && !editor.available && (
										<div className="wwc:mt-2 wwc:inline-flex wwc:items-center wwc:gap-1 wwc:text-xs wwc:text-amber-600">
											<TriangleAlert className="wwc:size-3.5" />
											{editor.label} isn't on your PATH — we'll give you a command to run.
										</div>
									)}
									<div className="wwc:mt-3">
										<label
											htmlFor="wc-ws-location"
											className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground"
										>
											Workspace location
										</label>
										<Input
											id="wc-ws-location"
											value={location}
											onChange={(e) => setLocation(e.target.value)}
											placeholder="~/core-workspaces/…"
											className="wwc:mt-1 wwc:font-mono wwc:text-xs"
											spellCheck={false}
										/>
									</div>
									<div className="wwc:mt-3">
										<label
											htmlFor="wc-ws-prompt"
											className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground"
										>
											Starting prompt (optional)
										</label>
										<textarea
											id="wc-ws-prompt"
											value={prompt}
											onChange={(e) => setPrompt(e.target.value)}
											placeholder="e.g. Add a company logo to the header"
											rows={2}
											className="wwc:mt-1 wwc:w-full wwc:rounded-md wwc:border wwc:border-input wwc:bg-background wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:placeholder:text-muted-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
										/>
									</div>
								</>
							)}

							{error && <div className="wwc:mt-3 wwc:text-xs wwc:text-destructive">{error}</div>}

							<div className="wwc:mt-4 wwc:flex wwc:justify-end wwc:gap-2">
								<button
									onClick={() => setOpen(false)}
									className="wwc:rounded-md wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:text-muted-foreground wwc:hover:bg-muted"
								>
									Cancel
								</button>
								<button
									onClick={submit}
									disabled={submitting || (!isClaude && !location.trim())}
									className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:bg-primary wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-primary-foreground wwc:disabled:opacity-50"
								>
									{submitting && <Loader2 className="wwc:size-3.5 wwc:animate-spin" />}
									{isClaude
										? mode === "terminal"
											? "Open in terminal"
											: "Open in Claude Code"
										: "Create workspace & launch"}
								</button>
							</div>
						</>
					) : session ? (
						/* Claude session result — browser (Remote Control URL) or terminal (copyable command) */
						<>
							<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:font-semibold">
								{session.launch.launched || session.launch.target === "terminal" ? (
									<Check className="wwc:size-4 wwc:text-emerald-600" />
								) : (
									<TriangleAlert className="wwc:size-4 wwc:text-amber-600" />
								)}
								{session.launch.target === "terminal"
									? session.launch.launched
										? "Terminal opened"
										: "Run this in your terminal"
									: session.launch.launched
										? "Claude Code session opened"
										: "Run this to open the session"}
							</div>
							<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
								{session.error
									? `${session.error} `
									: session.launch.target === "terminal"
										? "Working in an isolated worktree of the Core repo. Run the command below in any terminal — Terminal.app, iTerm, or VS Code's integrated terminal. Your edits stay on this session's branch and never touch the original."
										: session.launch.launched
											? "Opened in your browser, working in an isolated worktree of the Core repo. Your edits stay on this session's branch and never touch the original template."
											: ""}
							</p>
							{session.branch && (
								<div className="wwc:mt-2 wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded wwc:border wwc:border-border wwc:px-1.5 wwc:py-0.5 wwc:font-mono wwc:text-[10px] wwc:text-muted-foreground">
									<GitBranch className="wwc:size-3" />
									{session.branch}
								</div>
							)}
							{session.launch.target === "browser" && session.launch.launched && session.launch.url ? (
								<div className="wwc:mt-2">
									<a
										href={session.launch.url}
										target="_blank"
										rel="noreferrer"
										className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:px-2 wwc:py-1 wwc:text-xs wwc:text-primary wwc:hover:bg-muted"
									>
										<ExternalLink className="wwc:size-3.5" />
										Open the session
									</a>
								</div>
							) : (
								commandRow(session.launch.command)
							)}
							{session.launch.target === "terminal" && session.launch.previewUrl && (
								<div className="wwc:mt-2 wwc:text-[11px] wwc:text-muted-foreground">
									The standalone preview will come up at{" "}
									<span className="wwc:font-mono">{session.launch.previewUrl}</span> once deps finish installing.
								</div>
							)}
							<div className="wwc:mt-4 wwc:flex wwc:justify-end">
								<button
									onClick={() => {
										setOpen(false);
										reset();
									}}
									className="wwc:rounded-md wwc:bg-primary wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-primary-foreground"
								>
									Done
								</button>
							</div>
						</>
					) : result ? (
						/* Local-editor (materialized workspace) result */
						<>
							<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:font-semibold">
								<Check className="wwc:size-4 wwc:text-emerald-600" />
								Workspace created
							</div>
							<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
								{launchMessage(result.editor.label, result.launch)}
							</p>
							{!result.launch.launched && commandRow(result.launch.command)}
							<div className="wwc:mt-2 wwc:break-all wwc:text-[11px] wwc:text-muted-foreground">
								{result.workspace.path}
							</div>
							<div className="wwc:mt-4 wwc:flex wwc:justify-end">
								<button
									onClick={() => {
										setOpen(false);
										reset();
									}}
									className="wwc:rounded-md wwc:bg-primary wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-primary-foreground"
								>
									Done
								</button>
							</div>
						</>
					) : null}
				</div>
			)}
		</div>
	);
}
