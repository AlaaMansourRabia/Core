import {Button} from "@core/core-ui/button";
import {CoreAppSidebar, type SidebarNavGroup} from "@core/core-ui/navigation/core-app-sidebar";
import {CoreAppTopBar} from "@core/core-ui/navigation/core-app-top-bar";
import {BookOpen, ExternalLink, Github, Moon, Palette, Sun, Terminal, Wand2} from "lucide-react";
import {useEffect, useState} from "react";

import {DesignerApp} from "@/DesignerApp";
import DeveloperAccessPage from "@/pages/DeveloperAccessPage";
import {StudioPage} from "@/pages/StudioPage";

// The Core Hub shell. One app, built from Core's own CoreAppSidebar + CoreAppTopBar, with four
// tabs that each swap the stage:
//   - Studio         → the Core Studio (runs locally; shows a card in the cloud)
//   - Storybook      → a page linking to /storybook/, opened in a new tab
//   - Designers Hub  → the component/widget/template/theme showcase, mounted NATIVELY (no iframe)
//   - Developer Access → the hosted MCP connection details
// A single light/dark toggle in the top bar themes the whole shell (and the natively-mounted Designers
// Hub follows it — same document, one `.dark` on <html>).
type FeatureId = "studio" | "storybook" | "designer" | "developer";

function readEnv(key: string): string | undefined {
	try {
		return (import.meta as unknown as {env?: Record<string, string>}).env?.[key];
	} catch {
		return undefined;
	}
}

// Storybook is built into this same deployment under /storybook/ (opened in a new tab). Override with
// VITE_STORYBOOK_URL to point at a separately-hosted Storybook.
//
// In DEV that co-located path does not exist: the Vite dev server has no /storybook/ route, so it
// answers with the SPA fallback — a 200 carrying this app's own index.html, which opens as a blank
// tab rather than a visible 404. Storybook runs as its own dev server on :6006 (apps/hub/start.sh
// boots it there, and apps/hub/src/App.tsx already falls back to exactly this), so point at it.
const STORYBOOK_URL =
	readEnv("VITE_STORYBOOK_URL") ??
	(typeof window === "undefined" || import.meta.env.DEV
		? "http://localhost:6006"
		: `${window.location.origin}/storybook/`);
const THEME_KEY = "wc-hub-theme";

type Feature = {
	id: FeatureId;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	badge?: string;
};

const FEATURES: Feature[] = [
	{id: "designer", label: "Designers Hub", icon: Palette},
	{id: "storybook", label: "Storybook", icon: BookOpen},
	{id: "studio", label: "Studio", icon: Wand2},
	{id: "developer", label: "Developer Access", icon: Terminal},
];

const NAV_GROUPS: SidebarNavGroup[] = [
	{items: FEATURES.map((f) => ({id: f.id, label: f.label, icon: f.icon, badge: f.badge}))},
];

const BY_LABEL = new Map(FEATURES.map((f) => [f.label, f.id] as const));
const FEATURE_IDS: FeatureId[] = ["studio", "storybook", "designer", "developer"];

// Parse the current URL into the active tab. Designers Hub owns the "/designer/*" sub-tree (its own
// router), so anything under /designer is the designer tab; unknown paths land on Designers Hub.
function parseFeature(): FeatureId {
	const seg = window.location.pathname.split("/").filter(Boolean)[0];
	return FEATURE_IDS.includes(seg as FeatureId) ? (seg as FeatureId) : "designer";
}

// Resolve the initial tab AND normalize the URL synchronously (before first render, so DesignerApp's
// BrowserRouter reads the corrected location). When the URL isn't a known tab we default to Designers
// Hub — but its router has basename="/designer", so "/" must become "/designer" here; doing it in an
// effect is too late (the router already initialized at "/" and renders blank).
function resolveInitialFeature(): FeatureId {
	const seg = window.location.pathname.split("/").filter(Boolean)[0];
	if (FEATURE_IDS.includes(seg as FeatureId)) return seg as FeatureId;
	window.history.replaceState(null, "", "/designer");
	return "designer";
}

type SessionUser = {login: string; name: string; exp: number};

// Ask the gate who's signed in (drives the sidebar footer profile). In production this is the real
// GitHub user; in dev the functions don't run, so we fall back to a "Local Dev" user purely so the
// footer is previewable. `.json()` on the dev SPA-fallback HTML throws → handled the same as 401.
const DEV_USER: SessionUser = {login: "dev", name: "Local Dev", exp: 0};

function useSessionUser(): SessionUser | null {
	const [user, setUser] = useState<SessionUser | null>(null);
	useEffect(() => {
		let alive = true;
		const fallback = () => {
			if (alive && import.meta.env.DEV) setUser(DEV_USER);
		};
		fetch("/api/auth/me", {credentials: "same-origin"})
			.then((r) => (r.ok ? r.json() : null))
			.then((u) => {
				if (!alive) return;
				if (u?.login) setUser(u);
				else fallback();
			})
			.catch(fallback);
		return () => {
			alive = false;
		};
	}, []);
	return user;
}

// Sign out via a real POST to /api/auth/logout — the endpoint clears the session cookie and 302s back
// to /login. A form POST (not a link) because logout is a POST; the browser follows the redirect.
function postLogout() {
	const form = document.createElement("form");
	form.method = "POST";
	form.action = "/api/auth/logout";
	document.body.appendChild(form);
	form.submit();
}

export default function App() {
	const [active, setActive] = useState<FeatureId>(resolveInitialFeature);
	const user = useSessionUser();
	// Dark is the default — only an explicit "light" choice opts out.
	const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== "light");
	const feature = FEATURES.find((f) => f.id === active)!;

	// Switch tab and reflect it in the URL. For Designers Hub, land on its root so its router takes over.
	function go(id: FeatureId) {
		setActive(id);
		window.history.pushState(null, "", `/${id}`);
	}

	// Theme the whole shell (and, via the shared <html>.dark, the natively-mounted Designers Hub).
	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
	}, [dark]);

	// Keep the active tab in sync with browser back/forward.
	useEffect(() => {
		function onPop() {
			setActive(parseFeature());
		}
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, []);

	return (
		<div className="wwc:flex wwc:h-screen wwc:bg-background wwc:text-foreground">
			<div className="wwc:border-r wwc:border-border wwc:flex-shrink-0">
				<CoreAppSidebar
					seamless
					showSearch={false}
					showNotifications={false}
					showFooter
					user={user ? {name: user.name, email: `@${user.login}`} : undefined}
					onLogout={postLogout}
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
						<div className="wwc:rounded-lg wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-3">
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
					activeLabel={`Core / ${feature.label}`}
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

				<main className="wwc:flex-1 wwc:overflow-hidden">
					{/* Designers Hub is mounted natively — no iframe. It owns the "/designer/*" URL sub-tree. */}
					{active === "designer" && <DesignerApp dark={dark} />}
					{active === "storybook" && <StorybookLink />}
					{active === "studio" && (
						<div className="wwc:h-full wwc:overflow-auto">
							<StudioPage />
						</div>
					)}
					{active === "developer" && (
						<div className="wwc:h-full wwc:overflow-auto">
							<DeveloperAccessPage />
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

function StorybookLink() {
	// Inline the SVG (not an <img>) so the fade gradient's var(--background) resolves — it fades to white in
	// light mode and near-black in dark mode, blending into the page.
	const [svg, setSvg] = useState("");
	useEffect(() => {
		fetch("/automate.svg")
			.then((r) => r.text())
			.then(setSvg)
			.catch(() => {});
	}, []);

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
					Browse every Core component story in an isolated workbench — opens in a new tab.
				</p>
				<Button asChild className="wwc:mt-6">
					<a href={STORYBOOK_URL} target="_blank" rel="noreferrer">
						Open Storybook
						<ExternalLink className="wwc:h-4 wwc:w-4" />
					</a>
				</Button>
				<code className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">{STORYBOOK_URL}</code>
			</div>
		</div>
	);
}
