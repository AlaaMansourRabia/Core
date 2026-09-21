import * as React from "react";

// This dock lives in the Storybook *manager* iframe, which doesn't load @wakecap/core-ui's
// stylesheet (and importing it here would apply its CSS reset to Storybook's own chrome). So the
// visuals below mirror the design system's AIChat / PromptInput components by hand, using WakeCore's
// actual design tokens as literal oklch() values (the manager runs in a modern browser). WakeCore is
// a neutral/monochrome system — the primary is near-black, not a brand accent.

const BRIDGE = "http://localhost:47600";
const OPEN_KEY = "wc-chat-dock-open";

// The bridge (chat-bridge/server.mjs) spawns the Claude CLI at the repo root, so it only exists on a
// developer's machine. A hosted Storybook cannot reach it at all: Chrome refuses a request from a
// public HTTPS origin into the loopback address space ("Permission was denied for this request to
// access the `loopback` address space"), and `localhost` would be the *viewer's* machine anyway.
// Storybook stamps CONFIG_TYPE at build time, so — as with the HTML export tool — we say that up
// front instead of letting every question fail. Keep this in step with html-export/HtmlExportTool.tsx.
const IS_STATIC_BUILD = (globalThis as {CONFIG_TYPE?: string}).CONFIG_TYPE !== "DEVELOPMENT";
const LOCAL_ONLY_HINT =
	"Ask about this component runs only in local Storybook (pnpm --filter apps-storybook dev:chat) — it asks the Claude CLI through a bridge on your own machine, which the hosted build has no way to reach.";

// WakeCore design tokens (light theme) — see packages/tokens/dist/theme.css.
const T = {
	background: "oklch(1 0 0)",
	foreground: "oklch(0.145 0 0)",
	primary: "oklch(0.205 0 0)",
	primaryForeground: "oklch(0.985 0 0)",
	secondary: "oklch(0.97 0 0)",
	muted: "oklch(0.96 0 0)",
	mutedForeground: "oklch(0.556 0 0)",
	border: "oklch(0.92 0 0)",
	ring: "oklch(0.708 0 0)",
	destructive: "oklch(0.577 0.245 27.325)",
};

interface StorybookApi {
	getCurrentStoryData?: () => {title?: string; name?: string} | undefined;
}

interface Subject {
	component: string;
	group: string;
	title: string;
}

interface Msg {
	role: "user" | "assistant" | "error";
	content: string;
}

const SUGGESTIONS = ["What is it for?", "What props does it take?", "Show a usage example", "When shouldn't I use it?"];

function readSubject(api: StorybookApi): Subject {
	const data = api.getCurrentStoryData?.();
	const title = data?.title ?? "";
	const parts = title.split("/").filter(Boolean);
	return {title, component: parts[parts.length - 1] ?? "", group: parts.slice(0, -1).join(" / ")};
}

export function ChatDock({api}: {api: StorybookApi}) {
	const [open, setOpen] = React.useState(() => localStorage.getItem(OPEN_KEY) !== "false");
	const [subject, setSubject] = React.useState<Subject>(() => readSubject(api));
	const [input, setInput] = React.useState("");
	const [messages, setMessages] = React.useState<Msg[]>([]);
	const [loading, setLoading] = React.useState(false);
	const inFlight = React.useRef<AbortController | null>(null);
	const bodyRef = React.useRef<HTMLDivElement>(null);

	// Poll the current story. On the first populate we just adopt it; on any later change (the user
	// navigated to a different component) we clear the conversation. History is kept within a page —
	// only navigating away (or a refresh/close) resets it.
	React.useEffect(() => {
		let last = subject.title;
		const tick = () => {
			const next = readSubject(api);
			if (!next.title || next.title === last) return;
			const hadPrevious = last !== "";
			last = next.title;
			setSubject(next);
			if (hadPrevious) {
				setInput("");
				setMessages([]);
				setLoading(false);
				inFlight.current?.abort();
			}
		};
		tick();
		const id = window.setInterval(tick, 500);
		return () => window.clearInterval(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api]);

	React.useEffect(() => {
		bodyRef.current?.scrollTo({top: bodyRef.current.scrollHeight, behavior: "smooth"});
	}, [messages, loading]);

	const toggle = (next: boolean) => {
		setOpen(next);
		localStorage.setItem(OPEN_KEY, String(next));
	};

	const run = async (raw: string) => {
		const q = raw.trim();
		if (!q || loading) return;
		if (IS_STATIC_BUILD) {
			setMessages((prev) => [...prev, {role: "user", content: q}, {role: "error", content: LOCAL_ONLY_HINT}]);
			setInput("");
			return;
		}
		setInput("");
		setMessages((prev) => [...prev, {role: "user", content: q}]);
		setLoading(true);
		inFlight.current?.abort();
		const ctrl = new AbortController();
		inFlight.current = ctrl;
		try {
			const res = await fetch(`${BRIDGE}/ask`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({...subject, question: q}),
				signal: ctrl.signal,
			});
			const data = await res.json();
			setMessages((prev) => [
				...prev,
				data.error ? {role: "error", content: data.error} : {role: "assistant", content: data.answer || "(no answer)"},
			]);
		} catch (err) {
			if ((err as Error).name !== "AbortError") {
				setMessages((prev) => [
					...prev,
					{
						role: "error",
						content: IS_STATIC_BUILD
							? LOCAL_ONLY_HINT
							: `Couldn't reach the chat bridge at ${BRIDGE}.\nStart it with:  pnpm --filter apps-storybook chat-bridge`,
					},
				]);
			}
		} finally {
			setLoading(false);
		}
	};

	if (!open) {
		return (
			<button
				type="button"
				onClick={() => toggle(true)}
				disabled={IS_STATIC_BUILD}
				title={IS_STATIC_BUILD ? LOCAL_ONLY_HINT : "Ask about this component"}
				style={{...s.launcher, ...(IS_STATIC_BUILD ? {opacity: 0.4, cursor: "not-allowed"} : null)}}
			>
				<Sparkles size={22} color={T.primaryForeground} />
			</button>
		);
	}

	const idle = messages.length === 0 && !loading;
	const canSend = !loading && !IS_STATIC_BUILD && input.trim().length > 0;

	return (
		<div style={s.panel}>
			<button type="button" onClick={() => toggle(false)} title="Hide" style={s.floatX}>
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>

			<div ref={bodyRef} style={s.body}>
				{idle ? (
					<div style={s.empty}>
						<div style={s.emptyTitle}>Ask about {subject.component || "this component"}</div>
						{IS_STATIC_BUILD ? (
							<div style={s.emptySub}>{LOCAL_ONLY_HINT}</div>
						) : (
							<>
								<div style={s.emptySub}>Props, variants, when to use it, or a code example.</div>
								<div style={s.chips}>
									{SUGGESTIONS.map((sug) => (
										<button key={sug} type="button" style={s.chip} onClick={() => run(sug)}>
											{sug}
										</button>
									))}
								</div>
							</>
						)}
					</div>
				) : (
					<div style={s.thread}>
						{messages.map((m, i) =>
							m.role === "user" ? (
								<div key={i} style={s.userRow}>
									<div style={s.userBubble}>{m.content}</div>
								</div>
							) : m.role === "error" ? (
								<div key={i} style={s.errorText}>
									{m.content}
								</div>
							) : (
								<div key={i} style={s.answer}>
									<Markdown text={m.content} />
								</div>
							),
						)}
						{loading && (
							<div style={s.thinking}>
								<Dot /> <Dot delay={0.15} /> <Dot delay={0.3} /> <span style={{marginLeft: 6}}>Thinking…</span>
							</div>
						)}
					</div>
				)}
			</div>

			{/* PromptInput replica: one rounded bordered container, textarea + dark Send button bottom-right. */}
			<div style={s.inputArea}>
				<div style={s.promptBox}>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								run(input);
							}
						}}
						disabled={IS_STATIC_BUILD}
						placeholder={
							IS_STATIC_BUILD ? "Available in local Storybook" : `Ask about ${subject.component || "this component"}…`
						}
						rows={1}
						style={s.textarea}
					/>
					<div style={s.promptRow}>
						<button
							type="button"
							onClick={() => run(input)}
							disabled={!canSend}
							title="Send"
							style={{...s.send, opacity: canSend ? 1 : 0.4}}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke={T.primaryForeground}
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M12 19V5M5 12l7-7 7 7" />
							</svg>
						</button>
					</div>
				</div>
			</div>
			<style>{keyframes}</style>
		</div>
	);
}

// --- Minimal markdown renderer (headings, bold, italic, inline code, code fences, lists, links) ---

function renderInline(text: string, keyBase: string): React.ReactNode[] {
	const nodes: React.ReactNode[] = [];
	const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g;
	let last = 0;
	let m: RegExpExecArray | null;
	let k = 0;
	while ((m = re.exec(text))) {
		if (m.index > last) nodes.push(text.slice(last, m.index));
		const tok = m[0];
		const key = `${keyBase}-${k++}`;
		if (tok.startsWith("`"))
			nodes.push(
				<code key={key} style={mdStyle.inlineCode}>
					{tok.slice(1, -1)}
				</code>,
			);
		else if (tok.startsWith("**")) nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
		else if (tok.startsWith("*")) nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
		else if (tok.startsWith("_")) nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
		else {
			const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
			if (mm)
				nodes.push(
					<a key={key} href={mm[2]} target="_blank" rel="noreferrer" style={mdStyle.link}>
						{mm[1]}
					</a>,
				);
		}
		last = m.index + tok.length;
	}
	if (last < text.length) nodes.push(text.slice(last));
	return nodes;
}

function Markdown({text}: {text: string}) {
	const blocks: React.ReactNode[] = [];
	let key = 0;
	// Split on fenced code blocks; odd segments are code.
	const segments = text.replace(/\r\n/g, "\n").split(/```/);
	segments.forEach((seg, idx) => {
		if (idx % 2 === 1) {
			let body = seg;
			const nl = seg.indexOf("\n");
			if (nl !== -1 && /^[a-zA-Z0-9+#-]*$/.test(seg.slice(0, nl).trim())) body = seg.slice(nl + 1);
			blocks.push(
				<pre key={`b${key++}`} style={mdStyle.codeBlock}>
					<code>{body.replace(/\n$/, "")}</code>
				</pre>,
			);
			return;
		}
		const lines = seg.split("\n");
		let list: React.ReactNode[] | null = null;
		let ordered = false;
		let para: string[] = [];
		const flushList = () => {
			if (list) {
				blocks.push(
					ordered ? (
						<ol key={`b${key++}`} style={mdStyle.list}>
							{list}
						</ol>
					) : (
						<ul key={`b${key++}`} style={mdStyle.list}>
							{list}
						</ul>
					),
				);
				list = null;
			}
		};
		const flushPara = () => {
			if (para.length) {
				blocks.push(
					<p key={`b${key++}`} style={mdStyle.p}>
						{renderInline(para.join(" "), `b${key}`)}
					</p>,
				);
				para = [];
			}
		};
		for (const raw of lines) {
			const line = raw.replace(/\s+$/, "");
			const h = /^(#{1,6})\s+(.*)$/.exec(line);
			const ul = /^\s*[-*]\s+(.*)$/.exec(line);
			const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
			if (h) {
				flushPara();
				flushList();
				blocks.push(
					<div key={`b${key++}`} style={mdStyle.heading}>
						{renderInline(h[2], `b${key}`)}
					</div>,
				);
			} else if (ul) {
				flushPara();
				if (list && ordered) flushList();
				ordered = false;
				list = list || [];
				list.push(
					<li key={`b${key++}`} style={mdStyle.li}>
						{renderInline(ul[1], `b${key}`)}
					</li>,
				);
			} else if (ol) {
				flushPara();
				if (list && !ordered) flushList();
				ordered = true;
				list = list || [];
				list.push(
					<li key={`b${key++}`} style={mdStyle.li}>
						{renderInline(ol[1], `b${key}`)}
					</li>,
				);
			} else if (line.trim() === "") {
				flushPara();
				flushList();
			} else {
				flushList();
				para.push(line.trim());
			}
		}
		flushPara();
		flushList();
	});
	return <>{blocks}</>;
}

function Sparkles({size, color}: {size: number; color: string}) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
		</svg>
	);
}

function Dot({delay = 0}: {delay?: number}) {
	return <span style={{...s.dot, animationDelay: `${delay}s`}} />;
}

const keyframes = `@keyframes wcbounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-3px);opacity:1}}`;

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const mdStyle: Record<string, React.CSSProperties> = {
	p: {margin: "0 0 8px"},
	heading: {fontSize: 13.5, fontWeight: 600, margin: "10px 0 6px", color: T.foreground},
	list: {margin: "0 0 8px", paddingLeft: 18},
	li: {margin: "2px 0"},
	inlineCode: {fontFamily: mono, fontSize: 12, background: T.muted, borderRadius: 4, padding: "1px 4px"},
	codeBlock: {
		fontFamily: mono,
		fontSize: 12,
		background: T.muted,
		border: `1px solid ${T.border}`,
		borderRadius: 8,
		padding: 10,
		margin: "0 0 8px",
		overflowX: "auto",
		whiteSpace: "pre",
		lineHeight: 1.45,
	},
	link: {color: T.foreground, textDecoration: "underline"},
};

const s: Record<string, React.CSSProperties> = {
	launcher: {
		position: "fixed",
		bottom: 20,
		right: 20,
		width: 46,
		height: 46,
		borderRadius: 9999,
		background: T.primary,
		border: "none",
		boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2147483000,
	},
	panel: {
		position: "fixed",
		bottom: 20,
		right: 20,
		width: 380,
		maxHeight: 560,
		display: "flex",
		flexDirection: "column",
		background: T.background,
		color: T.foreground,
		border: `1px solid ${T.border}`,
		borderRadius: 16,
		boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
		zIndex: 2147483000,
		fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		overflow: "hidden",
	},
	floatX: {
		position: "absolute",
		top: 10,
		right: 10,
		width: 30,
		height: 30,
		borderRadius: 9999,
		background: "rgba(255,255,255,0.45)",
		backdropFilter: "blur(12px) saturate(180%)",
		WebkitBackdropFilter: "blur(12px) saturate(180%)",
		border: "1px solid rgba(255,255,255,0.7)",
		boxShadow: "0 2px 10px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.6)",
		color: T.foreground,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 3,
	},
	body: {flex: 1, overflowY: "auto", padding: "16px 14px 14px", minHeight: 160},
	empty: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
		padding: "24px 8px",
		gap: 6,
	},
	emptyTitle: {fontSize: 14, fontWeight: 600, color: T.foreground},
	emptySub: {fontSize: 12, color: T.mutedForeground, lineHeight: 1.5, maxWidth: 260},
	chips: {display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 10},
	chip: {
		background: T.background,
		border: `1px solid ${T.border}`,
		borderRadius: 9999,
		padding: "6px 12px",
		fontSize: 12,
		color: T.foreground,
		cursor: "pointer",
	},
	thread: {display: "flex", flexDirection: "column", gap: 14, paddingTop: 24},
	userRow: {display: "flex", justifyContent: "flex-end"},
	userBubble: {
		maxWidth: "80%",
		background: T.muted,
		color: T.foreground,
		borderRadius: 16,
		borderBottomRightRadius: 4,
		padding: "8px 14px",
		fontSize: 13,
		lineHeight: 1.5,
		whiteSpace: "pre-wrap",
	},
	answer: {fontSize: 13, lineHeight: 1.6, color: T.foreground},
	errorText: {fontSize: 12.5, lineHeight: 1.5, color: T.destructive, whiteSpace: "pre-wrap"},
	thinking: {display: "flex", alignItems: "center", fontSize: 12.5, color: T.mutedForeground},
	dot: {
		width: 5,
		height: 5,
		borderRadius: 9999,
		background: T.mutedForeground,
		display: "inline-block",
		marginRight: 3,
		animation: "wcbounce 1.2s infinite ease-in-out",
	},
	inputArea: {padding: "0 12px 12px"},
	promptBox: {
		display: "flex",
		flexDirection: "column",
		border: `1px solid ${T.border}`,
		borderRadius: 16,
		background: T.background,
	},
	textarea: {
		width: "100%",
		boxSizing: "border-box",
		resize: "none",
		maxHeight: 96,
		border: "none",
		background: "transparent",
		padding: "10px 14px 4px",
		fontSize: 13,
		lineHeight: "20px",
		fontFamily: "inherit",
		color: T.foreground,
		outline: "none",
	},
	promptRow: {display: "flex", justifyContent: "flex-end", padding: "0 8px 8px"},
	send: {
		width: 30,
		height: 30,
		borderRadius: 8,
		background: T.primary,
		border: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
};
