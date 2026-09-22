import {useState} from "react";

import {CoreAppSidebar} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {Toaster} from "../sonner";
import {
	AppDetailsDialog,
	APPS,
	AppWorkspace,
	HomeSurface,
	installedAppsGroup,
	MarketplaceSurface,
	useAppInstallation,
	type MarketApp,
} from "./app-marketplace-shared";

// App Installer — Core Connect V1's end-user portal: a marketplace template built on the shared app
// shell (CoreAppSidebar + CoreAppTopBar). The sidebar's "Home" and "App Store" entries are shared
// CoreAppSidebar affordances (present on every skeleton app); between them sit the installed apps (each
// with a green status dot) under "Your apps". Everyone lands on Home: a welcome hero that nudges toward
// the App Store while nothing is installed, an app launcher once apps exist. Installed apps open an
// (empty for now) workspace. The App Store surface is a browsable, installable catalog with App Store /
// Installed Apps tabs.
//
// The catalogue, the install lifecycle and the store surface all live in app-marketplace-shared.tsx,
// shared with the V2 merged template (CoreConnect) so the two releases can never drift apart.

// Surface: Home (landing), the App Store, or an installed app's (empty) workspace.
type Surface = "home" | "marketplace" | "app";

/**
 * App Installer template. Owns the shared app shell (CoreAppSidebar + CoreAppTopBar) with a single "Home"
 * entry plus the shared Marketplace plus. Home is the landing surface — a welcome hero (with a Browse App
 * Store CTA) while nothing is installed, an app launcher once apps exist. The App Store surface has two
 * tabs (App Store / Installed Apps), scrollable category pills, search, and a grid of app cards.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the AppInstaller template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function AppInstaller({userName = "Abdullah"}: {userName?: string} = {}) {
	const [navOpen, setNavOpen] = useState(false);
	// Top-level surface: everyone lands on Home; the App Store plus (or Home's CTA) opens the store; installed
	// apps in the sidebar open their (empty) workspace.
	const [surface, setSurface] = useState<Surface>("home");
	const [activeAppId, setActiveAppId] = useState<string | null>(null);

	const install = useAppInstallation({
		// Uninstalling the app you are currently looking at drops you back on Home.
		onUninstalled: (app) => {
			if (activeAppId !== app.id) return;
			setActiveAppId(null);
			setSurface("home");
		},
	});

	const activeApp = APPS.find((a) => a.id === activeAppId) ?? null;
	// Opening an app marks it seen, so its green "new" dot disappears.
	const openApp = (app: MarketApp) => {
		install.markOpened(app);
		setActiveAppId(app.id);
		setSurface("app");
	};

	// Sidebar apps: the shared Home entry (from CoreAppSidebar) sits above; here we list installed apps.
	const sidebarGroups = installedAppsGroup(install.installedApps, install.newIds);

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={sidebarGroups}
				activeItemId={surface === "app" && activeAppId ? `app-${activeAppId}` : undefined}
				homeActive={surface === "home"}
				onHome={() => setSurface("home")}
				onNavigate={(label) => {
					const app = install.installedApps.find((a) => a.name === label);
					if (app) openApp(app);
				}}
				showSearch={false}
				showNotifications={false}
				marketplaceActive={surface === "marketplace"}
				marketplaceLabel="App Store"
				onMarketplace={() => setSurface("marketplace")}
				mobileOpen={navOpen}
				onMobileOpenChange={setNavOpen}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar
					activeLabel={`App Installer / ${surface === "home" ? "Home" : surface === "app" && activeApp ? activeApp.name : "App Store"}`}
					showProjectSwitcher={false}
					showNotifications
					onMenuClick={() => setNavOpen(true)}
				/>

				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
					{surface === "home" ? (
						<HomeSurface
							userName={userName}
							installed={install.installedApps}
							newIds={install.newIds}
							onBrowse={() => setSurface("marketplace")}
							onOpenApp={openApp}
						/>
					) : surface === "app" ? (
						<AppWorkspace app={activeApp} />
					) : (
						<MarketplaceSurface
							isInstalled={install.isInstalled}
							installingIds={install.installingIds}
							installedCount={install.installedIds.size}
							onDetails={install.setDetailsApp}
							onToggle={install.toggleInstall}
						/>
					)}
				</main>
			</div>

			<AppDetailsDialog
				app={install.detailsApp}
				installed={install.detailsApp ? install.isInstalled(install.detailsApp.id) : false}
				installing={install.detailsApp ? install.installingIds.has(install.detailsApp.id) : false}
				onOpenChange={(open) => !open && install.setDetailsApp(null)}
				onToggle={() => install.detailsApp && install.toggleInstall(install.detailsApp)}
			/>
			<Toaster position="top-right" />
		</div>
	);
}
