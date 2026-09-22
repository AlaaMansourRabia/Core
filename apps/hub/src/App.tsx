import {Button} from "@core/core-ui/button";
import {CoreAppSidebar, type SidebarNavGroup} from "@core/core-ui/navigation/core-app-sidebar";
import {CoreAppTopBar} from "@core/core-ui/navigation/core-app-top-bar";
import {Blocks, BookOpen, Boxes, ExternalLink, Github, Moon, Palette, Shapes, Sun, Terminal, Wand2} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import DeveloperAccess from "./DeveloperAccess";

// The Hub: one localhost (:4000), built from Core's own app shell —
// CoreAppSidebar (the 3 feature tabs) + CoreAppTopBar. Each tab swaps the stage:
//  - Studio       → the Core Studio, embedded live (runs on :5001)
//  - Storybook    → a page holding just the Storybook link (runs on :6006)
//  - Designers Hub → the web showcase, embedded live (runs on :5002)
//  - WC3 Viewers  → the wc3-engineering-viewer workspace shell, embedded live (runs on :5180)
//  - That Open SDK → the upstream ThatOpen reference material, embedded live (runs on :5301-:5303)
//  - Img to 3D    → an img2threejs-generated procedural model, embedded live (runs on :5401)
//
// A single light/dark toggle lives in the top bar. It themes the hub shell and is
// broadcast to the embedded iframes via postMessage; Product Hub (apps/web) listens
// and follows. (Studio has no dark theme, so it stays light.)
type FeatureId = "studio" | "storybook" | "designer" | "viewers" | "thatopen" | "imgto3d" | "developer";

// Embedded-app URLs are env-configurable so the hub works both locally (start.sh boots them on these
// ports) and when hosted (point them at deployed URLs). Studio needs a local Node backend, so it has
// no hosted URL — in production its tab shows a "runs locally" card instead of a broken iframe.
function readEnv(key: string): string | undefined {
	try {
		return (import.meta as unknown as {env?: Record<string, string>}).env?.[key];
	} catch {
		return undefined;
	}
}

const STUDIO_URL = readEnv("VITE_STUDIO_URL") ?? "http://localhost:5001";
const STORYBOOK_URL = readEnv("VITE_STORYBOOK_URL") ?? "http://localhost:6006";
const DESIGNER_URL = readEnv("VITE_DESIGNER_URL") ?? "http://localhost:5002";
// The WC3 3D/BIM spikes live in a separate repo (core/wc3-engineering-viewer). Its workspace shell
// already navigates between the eight viewers, so the hub embeds that one URL instead of each viewer.
const WC3_SHELL_URL = readEnv("VITE_WC3_SHELL_URL") ?? "http://127.0.0.1:5180";
// The upstream That Open (github.com/ThatOpen) repos, served straight from their own dev servers so
// what you see is the SDK's own material, not our restatement of it. Three angles on the same stack:
// what the engine can do, what their UI kit looks like, and what a finished app built on both feels like.
const TOC_SOURCES = [
	{
		id: "examples",
		label: "SDK Examples",
		blurb: "Every @thatopen/components + components-front capability as a live example — engine_components",
		url: readEnv("VITE_TOC_EXAMPLES_URL") ?? "http://127.0.0.1:5301",
	},
	{
		id: "ui",
		label: "UI Components",
		blurb: "Their BIM-oriented web component kit — panels, tables, trees, toolbars — engine_ui-components",
		url: readEnv("VITE_TOC_UI_URL") ?? "http://127.0.0.1:5302",
	},
	{
		id: "app",
		label: "BIM App",
		blurb: "The create-bim-app starter running end to end — engine_templates/vanilla",
		url: readEnv("VITE_TOC_APP_URL") ?? "http://127.0.0.1:5303",
	},
] as const;
// A procedural Three.js model built from one reference image by the img2threejs skill, running in
// its own tiny Vite app (~/Projects-Prototypes/img2threejs-worker). Reconstruction-by-code, not a
// mesh download — the embed just shows the generated model orbiting.
const IMG2THREE_URL = readEnv("VITE_IMG2THREE_URL") ?? "http://127.0.0.1:5401";
const THEME_KEY = "wc-hub-theme";

export const coreInventory = {
	templates: ["MapCompareLayout"],
	widgets: ["CoreAppSidebar", "CoreAppTopBar", "FragmentViewer", "ToolbarStats", "WorkerProfile"],
	components: ["AppCard", "Card", "ImageZoom", "Sidebar", "TimeScrubber", "TreeRow"],
	tokens: ["color.background.surface", "color.border.primary"],
};

/** A localhost URL is unreachable once the hub is served from a real domain — show a fallback instead. */
function isLocalOnly(url: string): boolean {
	if (typeof window === "undefined") return false;
	return /localhost|127\.0\.0\.1/.test(url) && !/localhost|127\.0\.0\.1/.test(window.location.hostname);
}

type Feature = {
	id: FeatureId;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	badge?: string;
};

const FEATURES: Feature[] = [
	{id: "studio", label: "Studio", icon: Wand2, badge: "Beta"},
	{id: "storybook", label: "Storybook", icon: BookOpen},
	{id: "designer", label: "Designers Hub", icon: Palette},
	{id: "viewers", label: "WC3 Viewers", icon: Boxes, badge: "POC"},
	{id: "thatopen", label: "That Open SDK", icon: Blocks, badge: "Ref"},
	{id: "imgto3d", label: "Img to 3D", icon: Shapes, badge: "POC"},
	{id: "developer", label: "Developer Access", icon: Terminal},
];

// Studio needs a local Node backend (it launches editors/terminals), so it can't run in the cloud —
// its tab stays visible and shows a "runs locally" card there. All tabs are always shown.
const HOSTED = isLocalOnly(STUDIO_URL);

// Drive CoreAppSidebar with all features as a single nav group.
const NAV_GROUPS: SidebarNavGroup[] = [
	{items: FEATURES.map((f) => ({id: f.id, label: f.label, icon: f.icon, badge: f.badge, href: `/${f.id}`}))},
];

const BY_LABEL = new Map(FEATURES.map((f) => [f.label, f.id] as const));

const FEATURE_IDS: FeatureId[] = ["studio", "storybook", "designer", "viewers", "thatopen", "imgto3d", "developer"];

// The Hub URL reflects routing: /studio, /storybook, /designer, and for Designers Hub the embedded
// sub-route too (e.g. /designer/components/button). Parse the current URL into feature + designer sub-path.
function parseUrl(): {feature: FeatureId; designerPath: string} {
	const segs = window.location.pathname.split("/").filter(Boolean);
	// When hosted (Studio can't run in the cloud), land on the tab that works there: Developer Access.
	const fallback: FeatureId = HOSTED ? "developer" : "studio";
	const feature = FEATURE_IDS.includes(segs[0] as FeatureId) ? (segs[0] as FeatureId) : fallback;
	const designerPath = feature === "designer" && segs.length > 1 ? "/" + segs.slice(1).join("/") : "";
	return {feature, designerPath};
}

export default function App() {
	const initial = useRef(parseUrl());
	const [active, setActive] = useState<FeatureId>(initial.current.feature);
	// Dark is the default — only an explicit "light" choice opts out.
	const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== "light");
	const [studioLabel, setStudioLabel] = useState<string | null>(null);
	const [designerLabel, setDesignerLabel] = useState<string | null>(null);
	const feature = FEATURES.find((f) => f.id === active)!;

	// The Designers Hub iframe deep-links to the sub-route from the URL on first load, then navigates
	// internally (we sync the Hub URL from its postMessages without reloading the iframe). Normalize the
	// join so a trailing-slash base (e.g. "/designers/") + sub-path doesn't produce a double slash, and
	// the root case keeps its trailing slash (Vercel serves the app's index.html from "/designers/").
	const designerBase = DESIGNER_URL.replace(/\/$/, "");
	const designerSrc = designerBase + (initial.current.designerPath || "/");
	const designerTemplateId = initial.current.designerPath.match(/^\/templates\/([^/]+)/)?.[1];

	// Read `active` inside the stable message/popstate listeners without re-subscribing.
	const activeRef = useRef(active);
	useEffect(() => {
		activeRef.current = active;
	}, [active]);

	// Switch feature tab and reflect it in the Hub URL.
	function go(id: FeatureId) {
		setActive(id);
		window.history.pushState(null, "", `/${id}`);
	}

	// Theme the hub shell and remember the choice.
	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
	}, [dark]);

	// The embedded apps report their current context so it shows in the top breadcrumb, and — for the
	// Designers Hub — the Hub URL is kept in sync with the sub-route the user navigates to inside it.
	useEffect(() => {
		function onMessage(e: MessageEvent) {
			const d = e.data;
			if (!d) return;
			if (d.type === "wc-studio-context") setStudioLabel(d.label ?? null);
			if (d.type === "wc-designer-context") {
				setDesignerLabel(d.label ?? null);
				if (activeRef.current === "designer") {
					const p = d.path && d.path !== "/" ? d.path : "";
					window.history.replaceState(null, "", `/designer${p}`);
				}
			}
		}
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	// Keep the active tab in sync with browser back/forward.
	useEffect(() => {
		function onPop() {
			setActive(parseUrl().feature);
		}
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, []);

	const activeLabel =
		active === "studio" && studioLabel
			? `Core / Studio / ${studioLabel}`
			: active === "designer" && designerLabel
				? `Core / Designers Hub / ${designerLabel}`
				: `Core / ${feature.label}`;

	return (
		<div
			className="wwc:flex wwc:h-screen wwc:bg-background wwc:text-foreground"
			data-core-shell="core-catalog-shell"
			data-core-density="comfortable"
			data-core-brand="core"
			data-core-navigation-fingerprint="core-catalog-navigation"
			data-core-provider-owner="application-root"
		>
			<div
				className="wwc:border-r wwc:border-border wwc:flex-shrink-0"
				data-core-sidebar="catalog-navigation"
				data-core-artifact="core-app-sidebar"
				data-core-density="comfortable"
				data-core-navigation-fingerprint="core-catalog-navigation"
				data-core-region="catalog"
			>
				<CoreAppSidebar
					seamless
					showSearch={false}
					showNotifications={false}
					showFooter={false}
					logo={
						<img
							src="/core-large.svg"
							alt="Core"
							className="wwc:h-5 wwc:w-auto wwc:max-w-full wwc:invert wwc:dark:invert-0"
						/>
					}
					logoCollapsed={
						<img src="/core-small.svg" alt="Core" className="wwc:h-6 wwc:w-auto wwc:invert wwc:dark:invert-0" />
					}
					viewLevel="project"
					projectGroups={NAV_GROUPS}
					footerContent={
						<div className="wwc:rounded-lg wwc:bg-muted/40 wwc:p-3">
							<div className="wwc:text-xs wwc:font-semibold wwc:text-foreground">Core</div>
							<p className="wwc:mt-1 wwc:text-[11px] wwc:leading-relaxed wwc:text-muted-foreground">
								One artifact library — tokens, components, widgets, templates — behind Studio, Storybook, and the
								Designers Hub.
							</p>
							<div className="wwc:mt-2 wwc:text-[10px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground/70">
								Updates &amp; news coming soon
							</div>
						</div>
					}
					activeItemId={active}
					onNavigate={(label) => {
						const id = BY_LABEL.get(label);
						if (id) go(id);
					}}
				/>
			</div>

			<div className="wwc:flex wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
				<CoreAppTopBar
					activeLabel={activeLabel}
					showProjectSwitcher={false}
					rightContent={
						<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-1">
							<Button variant="outline" size="sm" asChild className="wwc:h-8 wwc:rounded-full">
								<a href="https://github.com/core/Core" target="_blank" rel="noopener noreferrer">
									<Github />
									Core
								</a>
							</Button>
							<Button
								variant="ghost"
								icon
								onClick={() => setDark((v) => !v)}
								aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
								className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:hover:text-foreground"
							>
								{dark ? <Sun className="wwc:h-4 wwc:w-4" /> : <Moon className="wwc:h-4 wwc:w-4" />}
							</Button>
						</div>
					}
				/>

				<main
					className="wwc:flex-1 wwc:overflow-hidden"
					data-core-content-scroll
					data-core-scroll-owner="route-content"
					data-core-region={active === "designer" && designerTemplateId ? `${designerTemplateId}-template` : "catalog"}
					data-core-artifact={active === "designer" ? designerTemplateId : undefined}
					data-core-interaction={
						active === "designer" && designerTemplateId ? "open template from Designer navigation" : undefined
					}
					data-core-surface-owner="route"
					data-core-canvas-capabilities={
						active === "designer" ? "render-fragment-model,fallback-model,unbranded-canvas" : undefined
					}
					data-core-observable-state-changed={active === "designer" ? "true" : undefined}
				>
					{active === "studio" && <Embed title="Core Studio" url={STUDIO_URL} dark={dark} />}
					{active === "storybook" && <StorybookLink dark={dark} />}
					{active === "designer" && <Embed title="Designers Hub" url={designerSrc} dark={dark} />}
					{active === "viewers" && (
						<Embed
							title="WC3 Viewers"
							url={WC3_SHELL_URL}
							dark={dark}
							startCommand="WC3=1 pnpm hub"
							hint={
								<>
									Clone <code>core/wc3-engineering-viewer</code> and <code>core/wc3-example-dataset</code> beside your
									Core checkout first — see <code>apps/hub/README.md</code>.
								</>
							}
						/>
					)}
					{active === "thatopen" && <ThatOpen dark={dark} />}
					{active === "imgto3d" && (
						<Embed
							title="Img to 3D"
							url={IMG2THREE_URL}
							dark={dark}
							startCommand="IMG=1 pnpm hub"
							hint={
								<>
									A procedural Three.js worker generated from one reference image by the <code>img2threejs</code> skill.
									Its viewer lives in <code>~/Projects-Prototypes/img2threejs-worker</code>.
								</>
							}
						/>
					)}
					{active === "developer" && <DeveloperAccess />}
				</main>
			</div>
		</div>
	);
}

// `startCommand` opts an embed into a readiness probe: apps that start.sh boots by default are always
// there, but an opt-in one (WC3 Viewers) may not be — show how to start it instead of a blank iframe.
function Embed({
	title,
	url,
	dark,
	startCommand,
	hint,
}: {
	title: string;
	url: string;
	dark: boolean;
	startCommand?: string;
	hint?: React.ReactNode;
}) {
	const ref = useRef<HTMLIFrameElement>(null);
	const [attempt, setAttempt] = useState(0);
	const [reach, setReach] = useState<"checking" | "up" | "down">("up");

	// Broadcast the current theme to the embedded app — on load and whenever it
	// changes. Apps that don't listen (Studio) simply ignore the message.
	const post = () => ref.current?.contentWindow?.postMessage({type: "wc-set-theme", dark}, "*");
	useEffect(post, [dark]);

	// A no-cors fetch resolves opaque as soon as the port answers and rejects when nothing is listening —
	// enough to tell "server down" from "server up", without needing CORS headers from the embedded app.
	useEffect(() => {
		if (!startCommand) return;
		let cancelled = false;
		setReach("checking");
		fetch(url, {mode: "no-cors", cache: "no-store"})
			.then(() => !cancelled && setReach("up"))
			.catch(() => !cancelled && setReach("down"));
		return () => {
			cancelled = true;
		};
	}, [url, startCommand, attempt]);

	if (isLocalOnly(url)) return <LocalOnly title={title} />;
	if (startCommand && reach === "checking") return <div className="wwc:h-full wwc:w-full wwc:bg-background" />;
	if (startCommand && reach === "down") {
		return (
			<NotRunning title={title} url={url} command={startCommand} hint={hint} onRetry={() => setAttempt((n) => n + 1)} />
		);
	}

	return (
		<iframe
			ref={ref}
			className="wwc:h-full wwc:w-full wwc:border-0 wwc:bg-white"
			title={title}
			src={url}
			onLoad={post}
		/>
	);
}

// The That Open reference material is three separate dev servers rather than one, so the tab carries its
// own source switcher above the stage. Deliberately thin chrome: the point is to see their surfaces
// unedited, not a Core restatement of them.
function ThatOpen({dark}: {dark: boolean}) {
	const [sourceId, setSourceId] = useState<(typeof TOC_SOURCES)[number]["id"]>("examples");
	const source = TOC_SOURCES.find((s) => s.id === sourceId)!;

	return (
		<div className="wwc:flex wwc:h-full wwc:flex-col">
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3 wwc:border-b wwc:border-border wwc:px-4 wwc:py-2">
				<div className="wwc:flex wwc:gap-1">
					{TOC_SOURCES.map((s) => (
						<Button
							key={s.id}
							variant={s.id === sourceId ? "secondary" : "ghost"}
							size="sm"
							className="wwc:h-7"
							onClick={() => setSourceId(s.id)}
						>
							{s.label}
						</Button>
					))}
				</div>
				<p className="wwc:text-xs wwc:text-muted-foreground">{source.blurb}</p>
				<Button variant="ghost" size="sm" asChild className="wwc:ml-auto wwc:h-7">
					<a href={source.url} target="_blank" rel="noopener noreferrer">
						Open directly
						<ExternalLink />
					</a>
				</Button>
			</div>
			<div className="wwc:min-h-0 wwc:flex-1">
				<Embed
					key={source.id}
					title={`That Open — ${source.label}`}
					url={source.url}
					dark={dark}
					startCommand="TOC=1 pnpm hub"
					hint={
						<>
							Clone <code>ThatOpen/engine_components</code>, <code>engine_ui-components</code> and{" "}
							<code>engine_templates</code> into a <code>thatopen/</code> folder beside your Core checkout — see{" "}
							<code>apps/hub/README.md</code>.
						</>
					}
				/>
			</div>
		</div>
	);
}

// Shown for an embedded app that only exists on a local dev server (no hosted URL). Keeps the hosted
// hub clean instead of rendering a broken localhost iframe.
function LocalOnly({title}: {title: string}) {
	return (
		<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
			<div className="wwc:max-w-md wwc:text-center">
				<h3 className="wwc:text-lg wwc:font-semibold">{title} runs locally</h3>
				<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">
					This view is served by a local dev server. Start the full hub on your machine to use it:
				</p>
				<code className="wwc:mt-4 wwc:inline-block wwc:rounded wwc:bg-muted wwc:px-3 wwc:py-1.5 wwc:text-sm">
					pnpm hub
				</code>
				<p className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">
					Then open <code>http://localhost:4000</code>. The <strong>Developer Access</strong> tab works here in the
					cloud today.
				</p>
			</div>
		</div>
	);
}

// Shown when an opt-in embed's dev server isn't listening — carries the command that starts it.
function NotRunning({
	title,
	url,
	command,
	hint,
	onRetry,
}: {
	title: string;
	url: string;
	command: string;
	hint?: React.ReactNode;
	onRetry: () => void;
}) {
	return (
		<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
			<div className="wwc:max-w-md wwc:text-center">
				<h3 className="wwc:text-lg wwc:font-semibold">{title} isn&rsquo;t running</h3>
				<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">
					Nothing is listening on <code>{url}</code>. This lives in a separate repo, so the hub only starts it on
					request:
				</p>
				<code className="wwc:mt-4 wwc:inline-block wwc:rounded wwc:bg-muted wwc:px-3 wwc:py-1.5 wwc:text-sm">
					{command}
				</code>
				{hint && <p className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">{hint}</p>}
				<Button variant="outline" size="sm" className="wwc:mt-4" onClick={onRetry}>
					Retry
				</Button>
			</div>
		</div>
	);
}

function StorybookLink({dark}: {dark: boolean}) {
	// Inline the SVG (not an <img>) so the fade gradient's var(--background) resolves — it fades to white in
	// light mode and near-black in dark mode, blending into the page.
	const [svg, setSvg] = useState("");
	useEffect(() => {
		fetch("/automate.svg")
			.then((r) => r.text())
			.then(setSvg)
			.catch(() => {});
	}, []);

	const localOnly = isLocalOnly(STORYBOOK_URL);
	const storyPath = new URLSearchParams(window.location.search).get("path");
	if (storyPath) {
		const storyUrl = new URL(STORYBOOK_URL);
		storyUrl.searchParams.set("path", storyPath);
		const isTimesheetStory = storyPath.includes("templates-timesheet");
		return (
			<div
				className="wwc:h-full"
				data-core-region={isTimesheetStory ? "timesheet-template" : "storybook-preview"}
				data-core-artifact={isTimesheetStory ? "timesheet" : undefined}
				data-core-surface-owner={isTimesheetStory ? "artifact" : "route"}
				data-core-interaction={
					isTimesheetStory ? "render existing command center without behavioral changes" : undefined
				}
			>
				<Embed title={isTimesheetStory ? "Storybook — Timesheet" : "Storybook"} url={storyUrl.toString()} dark={dark} />
			</div>
		);
	}

	return (
		<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
			<div className="wwc:flex wwc:max-w-3xl wwc:flex-col wwc:items-center wwc:text-center">
				<div
					aria-label="Storybook"
					className="wwc:mb-2 wwc:w-[680px] wwc:max-w-full"
					dangerouslySetInnerHTML={{__html: svg}}
				/>
				<h3 className="wwc:mt-4 wwc:text-lg wwc:font-semibold">Storybook</h3>
				<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">
					Browse every Core component story in an isolated workbench.
				</p>
				{localOnly ? (
					<p className="wwc:mt-4 wwc:text-sm wwc:text-muted-foreground">
						Runs locally — start it with{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1.5 wwc:py-0.5">pnpm hub</code>, or set{" "}
						<code>VITE_STORYBOOK_URL</code> to a hosted Storybook.
					</p>
				) : (
					<>
						<Button asChild className="wwc:mt-6">
							<a href={STORYBOOK_URL} target="_blank" rel="noreferrer">
								Open Storybook
								<ExternalLink className="wwc:h-4 wwc:w-4" />
							</a>
						</Button>
						<code className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">{STORYBOOK_URL}</code>
					</>
				)}
			</div>
		</div>
	);
}
