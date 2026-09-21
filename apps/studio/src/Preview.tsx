import {ArrowLeft, Code2, Loader2, Monitor, Moon, Smartphone, Sun, Tablet} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {EditLauncher} from "./EditLauncher";
import {formatTemplateName} from "./lib/catalog";
import {loadPreview, type PreviewResult} from "./lib/preview";

const DEVICES = {
	desktop: {icon: Monitor, w: "100%"},
	tablet: {icon: Tablet, w: "834px"},
	mobile: {icon: Smartphone, w: "390px"},
} as const;
type Device = keyof typeof DEVICES;

// A stable shell that loads the renderer once and evaluates the compiled canonical bundle the parent posts.
function shellDoc(origin: string): string {
	return `<!doctype html><html><head><meta charset="utf-8">
<base href="${origin}/">
<link rel="stylesheet" href="/vendor/wakecore-render.css">
<style>html,body{margin:0;height:100%;background:var(--background,#fff)}#r{min-height:100%}</style></head>
<body><div id="r"></div>
<script src="/vendor/wakecore-render.js"></script>
<script>
var root=document.getElementById("r");
window.addEventListener("message",function(e){
  if(!e||!e.data) return;
  if(e.data.type==="wc-render"){
    try{ window.WakeCore.renderModule(e.data.code, root); }
    catch(err){ root.innerHTML="<pre style='padding:16px;color:#b91c1c;white-space:pre-wrap'>"+String(err)+"</pre>"; }
  } else if(e.data.type==="wc-set-theme"){
    document.documentElement.classList.toggle("dark", !!e.data.dark);
  }
});
</script></body></html>`;
}

// Canonical Preview — renders one approved WakeCore template near full-screen with the real WakeCore
// renderer. Read-only: no chat, no agent, no session. The "Edit in Claude Code" action is a placeholder;
// editing happens externally and appears here only after review + merge.
export function Preview({templateId, onHome}: {templateId: string; onHome: () => void}) {
	const [result, setResult] = useState<PreviewResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [view, setView] = useState<"visual" | "code">("visual");
	const [device, setDevice] = useState<Device>("desktop");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [shellReady, setShellReady] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const shell = useMemo(() => shellDoc(window.location.origin), []);
	const busy = !result && !error;

	// Load the canonical template's source + compiled bundle.
	useEffect(() => {
		let alive = true;
		setResult(null);
		setError(null);
		loadPreview(templateId)
			.then((r) => alive && setResult(r))
			.catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
		return () => {
			alive = false;
		};
	}, [templateId]);

	// Push the compiled bundle into the shell whenever it (or shell readiness) changes.
	useEffect(() => {
		if (shellReady && result?.compiled)
			iframeRef.current?.contentWindow?.postMessage({type: "wc-render", code: result.compiled}, "*");
	}, [shellReady, result]);

	// Preview each template in its light or dark version (the class the WakeCore renderer themes on).
	useEffect(() => {
		if (shellReady) iframeRef.current?.contentWindow?.postMessage({type: "wc-set-theme", dark: theme === "dark"}, "*");
	}, [shellReady, theme]);

	// Report the current preview context to a host shell (the Hub) so it appears in the top breadcrumb.
	useEffect(() => {
		window.parent.postMessage(
			{type: "wc-studio-context", label: result ? formatTemplateName(result.template.name) : "Preview"},
			"*",
		);
	}, [result]);

	return (
		<div className="wwc:flex wwc:h-full wwc:flex-col wwc:bg-background wwc:text-foreground">
			{/* Top bar */}
			<div className="wwc:grid wwc:grid-cols-3 wwc:items-center wwc:border-b wwc:border-border wwc:px-4 wwc:py-2">
				{/* Left — Back + Visual / Code switcher */}
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:justify-self-start">
					<button
						onClick={onHome}
						className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:px-1.5 wwc:py-1 wwc:text-sm wwc:text-muted-foreground wwc:hover:bg-muted"
					>
						<ArrowLeft className="wwc:size-4" />
						Back
					</button>
					<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:rounded-md wwc:border wwc:border-border wwc:p-0.5 wwc:text-xs">
						{(["visual", "code"] as const).map((vw) => (
							<button
								key={vw}
								onClick={() => setView(vw)}
								className={`wwc:rounded wwc:px-2 wwc:py-1 wwc:capitalize ${view === vw ? "wwc:bg-muted wwc:text-foreground" : "wwc:text-muted-foreground"}`}
							>
								{vw}
							</button>
						))}
					</div>
				</div>

				{/* Center — device size + light/dark preview */}
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:justify-self-center">
					<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:rounded-md wwc:border wwc:border-border wwc:p-0.5">
						{(Object.keys(DEVICES) as Device[]).map((d) => {
							const Icon = DEVICES[d].icon;
							return (
								<button
									key={d}
									onClick={() => setDevice(d)}
									className={`wwc:rounded wwc:p-1.5 ${device === d ? "wwc:bg-muted wwc:text-foreground" : "wwc:text-muted-foreground"}`}
									title={d}
								>
									<Icon className="wwc:size-4" />
								</button>
							);
						})}
					</div>
					{/* Preview the template's light or dark version */}
					<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:rounded-md wwc:border wwc:border-border wwc:p-0.5">
						{(["light", "dark"] as const).map((t) => {
							const Icon = t === "light" ? Sun : Moon;
							return (
								<button
									key={t}
									onClick={() => setTheme(t)}
									className={`wwc:rounded wwc:p-1.5 ${theme === t ? "wwc:bg-muted wwc:text-foreground" : "wwc:text-muted-foreground"}`}
									title={`${t} mode`}
								>
									<Icon className="wwc:size-4" />
								</button>
							);
						})}
					</div>
				</div>

				{/* Right — template name + Edit action (materializes an external workspace, launches an editor) */}
				<div className="wwc:flex wwc:items-center wwc:justify-self-end wwc:gap-2">
					{result && (
						<span className="wwc:hidden wwc:text-xs wwc:text-muted-foreground wwc:sm:inline">
							{formatTemplateName(result.template.name)}
						</span>
					)}
					<EditLauncher templateId={templateId} />
				</div>
			</div>

			{/* Canonical note */}
			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:border-b wwc:border-border wwc:bg-muted/40 wwc:px-4 wwc:py-1.5 wwc:text-xs wwc:text-muted-foreground">
				<Code2 className="wwc:size-3.5 wwc:shrink-0" />
				Studio previews official WakeCore. Editing happens externally and appears here only after review and merge.
			</div>

			{/* The canonical app is the hero */}
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:justify-center wwc:overflow-auto wwc:bg-muted/30 wwc:p-4">
				{busy && (
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:self-center wwc:text-sm wwc:text-muted-foreground">
						<Loader2 className="wwc:size-4 wwc:animate-spin wwc:text-primary" />
						Rendering canonical WakeCore…
					</div>
				)}
				{error && (
					<div className="wwc:max-w-md wwc:self-center wwc:rounded-lg wwc:border wwc:border-destructive/40 wwc:bg-card wwc:p-4 wwc:text-center wwc:text-sm wwc:text-destructive">
						Couldn't render this template: {error}
					</div>
				)}
				{/* The shell iframe is always mounted (visual view) so it loads once; code view overlays it. */}
				{!error && (
					<iframe
						ref={iframeRef}
						title="WakeCore"
						srcDoc={shell}
						onLoad={() => setShellReady(true)}
						sandbox="allow-scripts allow-same-origin"
						className={`wwc:h-full wwc:rounded-lg wwc:border wwc:border-border wwc:bg-white wwc:shadow-sm ${view === "visual" && !busy ? "" : "wwc:hidden"}`}
						style={{width: DEVICES[device].w, maxWidth: "100%"}}
					/>
				)}
				{view === "code" && result && (
					<pre className="wwc:h-full wwc:w-full wwc:overflow-auto wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-4 wwc:text-xs wwc:leading-relaxed">
						<code>{result.code}</code>
					</pre>
				)}
			</div>
		</div>
	);
}
