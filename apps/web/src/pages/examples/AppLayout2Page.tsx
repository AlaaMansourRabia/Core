import {Maximize2} from "lucide-react";
import {useMemo, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {CopyButton} from "@/components/ui/copy-button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {CoreAppSidebar, DEFAULT_ORG_GROUPS, type SidebarNavGroup} from "@/components/ui/navigation/core-app-sidebar";
import {CoreAppTopBar} from "@/components/ui/navigation/core-app-top-bar";
import {ViewTabBar, type ViewTabItem} from "@/components/ui/view-tab-bar";

type SidebarMode = "collapsed" | "peek" | "pinned";

const PROJECTS = [
	"Fadhili GIP PKG 1",
	"ISSD_BI-10-13202",
	"Jafurah-JFGP-PKG-03",
	"Jafurah-Phase 2",
	"Jazan Refinery-Boiler Pkg.",
	"JC3C4",
	"Riyas",
	"Shaybah DPCU",
	"Sinopec",
	"SITP",
	"SRU_Yanbu_Refinery",
	"Turaif",
];

// The original Settings nav item is expandable with a second-level submenu inside
// the sidebar. For this layout we lift those sub-items out into a horizontal tab
// bar, so the sidebar Settings entry navigates directly (no in-sidebar second level).
const SETTINGS_LABEL = "Settings";

const SETTINGS_TABS: readonly ViewTabItem<string>[] = (() => {
	const settings = DEFAULT_ORG_GROUPS.flatMap((g) => g.items).find((i) => i.label === SETTINGS_LABEL);
	const subItems = settings?.subMenu?.groups.flatMap((g) => g.items) ?? [];
	return subItems.map((s) => ({id: s.id, label: s.label, icon: s.icon}));
})();

// Org groups with the Settings second-level submenu stripped — the item now just navigates.
const ORG_GROUPS_FLAT_SETTINGS: SidebarNavGroup[] = DEFAULT_ORG_GROUPS.map((group) => ({
	...group,
	items: group.items.map((item) =>
		item.label === SETTINGS_LABEL ? {...item, expandable: false, subMenu: undefined} : item,
	),
}));

export function AppLayout2Page() {
	const [activeLabel, setActiveLabel] = useState("Overview");
	const [sidebarMode, setSidebarMode] = useState<SidebarMode>("pinned");
	const [selectedProject, setSelectedProject] = useState("All Projects");
	const [settingsTab, setSettingsTab] = useState(SETTINGS_TABS[0]?.id ?? "");

	const viewLevel = selectedProject === "All Projects" ? "org" : "project";
	const [fullscreen, setFullscreen] = useState(false);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Settings is active whenever the current top-level selection is the Settings item.
	const inSettings = activeLabel === SETTINGS_LABEL || activeLabel.startsWith(`${SETTINGS_LABEL} / `);
	const activeSettingsTab = useMemo(
		() => SETTINGS_TABS.find((t) => t.id === settingsTab) ?? SETTINGS_TABS[0],
		[settingsTab],
	);

	function startHide() {
		hideTimer.current = setTimeout(() => setSidebarMode("collapsed"), 300);
	}
	function cancelHide() {
		if (hideTimer.current) clearTimeout(hideTimer.current);
	}
	function showPeek() {
		cancelHide();
		setSidebarMode((m) => (m === "collapsed" ? "peek" : m));
	}

	function handleNavigate(label: string, keepOpen?: boolean, parentLabel?: string) {
		if (label === SETTINGS_LABEL && activeSettingsTab) {
			// Entering Settings — show the first settings tab in the content tab bar.
			setActiveLabel(`${SETTINGS_LABEL} / ${activeSettingsTab.label}`);
		} else {
			setActiveLabel(parentLabel ? `${parentLabel} / ${label}` : label);
		}
		if (!keepOpen) setSidebarMode((m) => (m === "peek" ? "collapsed" : m));
	}

	function handleSettingsTabChange(id: string) {
		setSettingsTab(id);
		const tab = SETTINGS_TABS.find((t) => t.id === id);
		if (tab) setActiveLabel(`${SETTINGS_LABEL} / ${tab.label}`);
	}

	const isPinned = sidebarMode === "pinned";

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<h1 className="wwc:text-3xl wwc:font-bold">Layout #2</h1>
							<CopyButton
								value="Layout #2"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Same shell as Layout #1, but the Settings section's second-level navigation is lifted out of the sidebar
							into a horizontal <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ViewTabBar</code> under
							the top bar. Switch to the org view (All Projects) and open Settings to see it.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			{/* Layout example */}
			<div
				className={`wwc:overflow-hidden wwc:flex wwc:shadow-sm wwc:bg-background wwc:relative ${fullscreen ? "wwc:h-screen" : "wwc:border wwc:rounded-xl wwc:h-[700px]"}`}
			>
				{/* Spacer — pushes content when pinned */}
				<div
					className={`wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:flex-shrink-0 ${isPinned ? "wwc:w-[260px]" : "wwc:w-0"}`}
				/>

				{/* Single sidebar instance — absolute when peek/collapsed, in-flow spacer above handles push */}
				<div
					className={`wwc:absolute wwc:left-0 wwc:top-0 wwc:h-full wwc:w-[260px] wwc:z-30 wwc:transition-transform wwc:duration-200 wwc:ease-in-out ${
						sidebarMode === "collapsed" ? "wwc:-translate-x-full" : "wwc:translate-x-0"
					} ${sidebarMode === "peek" ? "wwc:shadow-[2px_0_12px_rgba(0,0,0,0.06)]" : ""}`}
					onMouseEnter={sidebarMode === "peek" ? cancelHide : undefined}
					onMouseLeave={sidebarMode === "peek" ? startHide : undefined}
				>
					<CoreAppSidebar
						onNavigate={handleNavigate}
						seamless
						viewLevel={viewLevel}
						orgGroups={ORG_GROUPS_FLAT_SETTINGS}
						onPin={!isPinned ? () => setSidebarMode("pinned") : undefined}
					/>
				</div>

				{/* Main area */}
				<div className={`wwc:flex-1 wwc:flex wwc:flex-col wwc:min-w-0 ${isPinned ? "wwc:border-l" : ""}`}>
					{/* Top bar */}
					<CoreAppTopBar
						activeLabel={activeLabel}
						selectedProject={selectedProject}
						projects={PROJECTS}
						isPinned={isPinned}
						onSelectProject={setSelectedProject}
						onToggleSidebar={() => setSidebarMode(isPinned ? "collapsed" : sidebarMode === "peek" ? "pinned" : "peek")}
						onHoverSidebar={() => {
							cancelHide();
							showPeek();
						}}
					/>

					{/* Settings second-level navigation, surfaced as a tab bar */}
					{inSettings && SETTINGS_TABS.length > 0 && (
						<div className="wwc:flex wwc:min-h-12 wwc:items-end wwc:border-b wwc:px-3">
							<ViewTabBar
								tabs={SETTINGS_TABS}
								activeTab={activeSettingsTab?.id ?? ""}
								onTabChange={handleSettingsTabChange}
							/>
						</div>
					)}

					{/* Content area */}
					<div className="wwc:flex-1 wwc:bg-muted/30 wwc:flex wwc:items-center wwc:justify-center">
						<p className="wwc:text-[13px] wwc:text-muted-foreground/70">Content for "{activeLabel}"</p>
					</div>
				</div>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
