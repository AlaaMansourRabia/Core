import {Component, type ReactNode, useEffect, useState} from "react";
// Written by prepare.mjs before Vite starts. Gitignored.
import manifest from "../.generated/manifest.json";

// Lazy importers for every generated snippet, keyed by filename (e.g. "side-panel.A4.tsx").
const loaders = import.meta.glob("../.generated/*.tsx");

type ArmInfo = {
	file: string | null;
	source: string;
	sourcePath?: string;
	meta?: {pass?: boolean; metrics?: Record<string, boolean>; compile?: string | null} | null;
};
type Task = {
	id: string;
	title: string;
	prompt: string;
	decision: string;
	differences: string[];
	arms: {A1: ArmInfo; A4: ArmInfo};
};

// Pick the component to render from a snippet module: default export, else first PascalCase export.
function pickComponent(mod: Record<string, unknown>): (() => ReactNode) | null {
	if (typeof mod.default === "function") return mod.default as () => ReactNode;
	for (const [name, val] of Object.entries(mod)) {
		if (typeof val === "function" && /^[A-Z]/.test(name)) return val as () => ReactNode;
	}
	return null;
}

class Boundary extends Component<{children: ReactNode}, {error: string | null}> {
	state = {error: null as string | null};
	static getDerivedStateFromError(e: unknown) {
		return {error: e instanceof Error ? e.message : String(e)};
	}
	render() {
		if (this.state.error) {
			return (
				<div style={{padding: 16, color: "#b00", font: "12px ui-monospace, monospace", whiteSpace: "pre-wrap"}}>
					⚠ This snippet failed to render in the browser:
					{"\n\n"}
					{this.state.error}
				</div>
			);
		}
		return this.props.children;
	}
}

function Preview({file}: {file: string | null}) {
	const [node, setNode] = useState<ReactNode>(<em style={{color: "#888"}}>loading…</em>);
	useEffect(() => {
		let alive = true;
		if (!file) {
			setNode(null);
			return;
		}
		const key = `../.generated/${file}`;
		const load = loaders[key];
		if (!load) {
			setNode(<em style={{color: "#888"}}>snippet not found: {file}</em>);
			return;
		}
		load()
			.then((mod) => {
				if (!alive) return;
				const Comp = pickComponent(mod as Record<string, unknown>);
				setNode(Comp ? <Comp /> : <em style={{color: "#888"}}>no renderable component export</em>);
			})
			.catch((e) => alive && setNode(<em style={{color: "#b00"}}>{String(e?.message ?? e)}</em>));
		return () => {
			alive = false;
		};
	}, [file]);
	return <Boundary>{node}</Boundary>;
}

// Full-screen inspection of one output. Renders the snippet in NORMAL document flow (no
// high z-index layer), so Radix overlays (Sheet/Dialog at z-50) and Sonner toasts (z-100),
// which portal to <body>, render ABOVE the preview and stay clickable. The only fixed element
// is a tiny close button pinned above everything so you can always exit. Esc also exits.
function FullScreen({title, file, onClose}: {title: string; file: string; onClose: () => void}) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	return (
		<div style={{minHeight: "100vh", background: "#fff"}}>
			{/* Pinned above all portaled overlays (z-50/100) so exit always works. */}
			<button
				type="button"
				onClick={onClose}
				style={{position: "fixed", top: 10, right: 12, zIndex: 2147483647, font: "600 12px system-ui", padding: "8px 14px", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.15)"}}
			>
				Close (Esc) ✕
			</button>
			<div style={{padding: "10px 16px", borderBottom: "1px solid #e3e5e8", font: "600 13px system-ui", color: "#444"}}>
				{title} — full screen · interact with the output directly (open the Sheet/Dialog, sort the table…)
			</div>
			<div style={{padding: 24}}>
				<Preview file={file} />
			</div>
		</div>
	);
}

function Panel({label, arm, onFull}: {label: string; arm: ArmInfo; onFull: () => void}) {
	return (
		<div style={{flex: 1, minWidth: 0, border: "1px solid #e3e5e8", borderRadius: 8, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column"}}>
			<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f0f1f3", borderBottom: "1px solid #e3e5e8", font: "600 12px system-ui"}}>
				<span>{label}</span>
				<span style={{display: "flex", gap: 10, alignItems: "center"}}>
					<span style={{color: "#777", fontWeight: 400}}>{arm.source}</span>
					{arm.file && (
						<button type="button" onClick={onFull} title="Inspect at full screen" style={{font: "600 11px system-ui", padding: "3px 8px", border: "1px solid #ccc", borderRadius: 5, background: "#fff", cursor: "pointer"}}>
							⛶ Full screen
						</button>
					)}
				</span>
			</div>
			<div style={{padding: 16, minHeight: 360, position: "relative", flex: 1}}>
				{arm.file ? (
					<Preview file={arm.file} />
				) : (
					<div style={{color: "#999", font: "13px system-ui", display: "grid", placeItems: "center", height: 320, textAlign: "center"}}>
						No snippet.
						<br />
						{arm.source}
					</div>
				)}
			</div>
			{arm.sourcePath && (
				<div style={{padding: "6px 10px", borderTop: "1px solid #eee", font: "11px ui-monospace, monospace", color: "#666", wordBreak: "break-all"}}>
					{arm.sourcePath}
					{arm.meta?.metrics && `  ·  compile=${arm.meta.metrics.compile} render=${arm.meta.metrics.render}`}
				</div>
			)}
		</div>
	);
}

function TaskCard({task, onFull}: {task: Task; onFull: (title: string, file: string) => void}) {
	return (
		<section style={{width: "100%", margin: "0 0 40px", background: "#fff", border: "1px solid #e3e5e8", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.04)"}}>
			<header style={{padding: "16px 20px", borderBottom: "1px solid #eee"}}>
				<h2 style={{margin: "0 0 6px", font: "600 18px system-ui"}}>{task.title}</h2>
				<p style={{margin: 0, font: "14px system-ui", color: "#444"}}>
					<strong>Goal:</strong> {task.prompt}
				</p>
			</header>

			<div style={{display: "flex", gap: 16, padding: 20, flexWrap: "wrap", alignItems: "stretch"}}>
				<Panel label="A1 · package only (fair baseline)" arm={task.arms.A1} onFull={() => task.arms.A1.file && onFull(`${task.title} · A1`, task.arms.A1.file)} />
				<Panel label="A4 · with WakeCore knowledge" arm={task.arms.A4} onFull={() => task.arms.A4.file && onFull(`${task.title} · A4`, task.arms.A4.file)} />
			</div>

			<div style={{padding: "0 20px 18px"}}>
				<p style={{margin: "0 0 6px", font: "600 13px system-ui"}}>Expected visible differences</p>
				<ul style={{margin: 0, paddingLeft: 20, font: "13px system-ui", color: "#333"}}>
					{task.differences.map((d) => (
						<li key={d}>{d}</li>
					))}
				</ul>
				<p style={{margin: "10px 0 0", font: "13px system-ui", color: "#555"}}>
					<strong>Decision:</strong> {task.decision}
				</p>
			</div>
		</section>
	);
}

export function Viewer() {
	const tasks = manifest.tasks as Task[];
	const [full, setFull] = useState<{title: string; file: string} | null>(null);

	// Full screen REPLACES the gallery (rather than layering over it) so portaled overlays
	// aren't trapped behind a high-z layer and stay interactive.
	if (full) return <FullScreen title={full.title} file={full.file} onClose={() => setFull(null)} />;

	return (
		<div style={{width: "100%", padding: "28px 32px 60px", boxSizing: "border-box"}}>
			<header style={{margin: "0 0 24px"}}>
				<h1 style={{margin: "0 0 6px", font: "700 24px system-ui"}}>WakeCore Showcase — A1 vs A4</h1>
				<p style={{margin: "0 0 4px", font: "14px system-ui", color: "#444"}}>
					Local visual comparison: package-only baseline (A1) vs full WakeCore knowledge (A4), same prompt and theme. Use <strong>⛶ Full screen</strong> on any output to inspect overlays (Sheet/Dialog/Toast) and wide tables at true size.
				</p>
				<p style={{margin: 0, font: "13px system-ui", color: "#a15", background: "#fff4f6", border: "1px solid #f3d3da", borderRadius: 6, padding: "8px 10px"}}>
					This is a visual example, not statistical proof. Aggregate evidence lives in <code>eval/EVIDENCE.md</code>.
				</p>
			</header>
			{tasks.map((t) => (
				<TaskCard key={t.id} task={t} onFull={(title, file) => setFull({title, file})} />
			))}
		</div>
	);
}
