import {Check, GitBranch, Maximize2, Plus, Upload} from "lucide-react";
import {useMemo, useRef, useState} from "react";
import {toast} from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CopyButton} from "@/components/ui/copy-button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const BASE_BRANCH = "main";
const INITIAL_BRANCHES = ["main", "feature/site-monitoring", "fix/sensor-mapping", "draft/q3-layout"];

// The original Settings nav item is expandable with a second-level submenu inside
// the sidebar. As in Layout #2, we lift those sub-items into a horizontal tab bar.
const SETTINGS_LABEL = "Settings";

const SETTINGS_TABS: readonly ViewTabItem<string>[] = (() => {
	const settings = DEFAULT_ORG_GROUPS.flatMap((g) => g.items).find((i) => i.label === SETTINGS_LABEL);
	const subItems = settings?.subMenu?.groups.flatMap((g) => g.items) ?? [];
	return subItems.map((s) => ({id: s.id, label: s.label, icon: s.icon}));
})();

const ORG_GROUPS_FLAT_SETTINGS: SidebarNavGroup[] = DEFAULT_ORG_GROUPS.map((group) => ({
	...group,
	items: group.items.map((item) =>
		item.label === SETTINGS_LABEL ? {...item, expandable: false, subMenu: undefined} : item,
	),
}));

/**
 * Branch controls for the top nav: a branch switcher, an uncommitted-changes
 * indicator, and a "Push to main" action gated behind a confirmation dialog.
 * Mirrors the GitHub / Conductor branch model — work happens on a branch, then
 * the whole changeset is pushed to the base branch at once.
 */
function BranchControls() {
	const [branches, setBranches] = useState(INITIAL_BRANCHES);
	const [current, setCurrent] = useState("feature/site-monitoring");
	const [changeCount, setChangeCount] = useState(3);
	const [ahead, setAhead] = useState(2);

	const onBase = current === BASE_BRANCH;
	const hasChanges = changeCount > 0 || ahead > 0;

	function createBranch() {
		const name = `branch/${branches.length + 1}`;
		setBranches((prev) => [...prev, name]);
		setCurrent(name);
		setChangeCount(0);
		setAhead(0);
	}

	function pushToMain() {
		toast(`Pushed ${current} to ${BASE_BRANCH}`, {
			description: `${ahead} commit${ahead === 1 ? "" : "s"} · ${changeCount} change${changeCount === 1 ? "" : "s"} merged.`,
		});
		setChangeCount(0);
		setAhead(0);
	}

	return (
		<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-2">
			{/* Branch switcher */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" className="wwc:gap-1.5">
						<GitBranch className="wwc:h-3.5 wwc:w-3.5" />
						<span className="wwc:max-w-[160px] wwc:truncate">{current}</span>
						{!onBase && hasChanges && (
							<Badge variant="secondary" className="wwc:ml-0.5 wwc:h-4 wwc:px-1.5 wwc:text-[10px]">
								{changeCount}
							</Badge>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="wwc:min-w-56">
					<DropdownMenuLabel className="wwc:text-[11px] wwc:font-normal wwc:text-muted-foreground">
						Switch branch · base {BASE_BRANCH}
					</DropdownMenuLabel>
					{branches.map((b) => (
						<DropdownMenuItem
							key={b}
							onSelect={() => setCurrent(b)}
							className="wwc:gap-2 wwc:[&_svg]:h-3.5 wwc:[&_svg]:w-3.5 wwc:[&_svg]:shrink-0"
						>
							<GitBranch />
							<span className="wwc:flex-1 wwc:truncate">{b}</span>
							{b === current && <Check className="wwc:text-foreground" />}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={createBranch} className="wwc:gap-2 wwc:[&_svg]:h-3.5 wwc:[&_svg]:w-3.5">
						<Plus />
						Create branch…
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Push-to-main action — only when not on base and there is work to push */}
			{!onBase && hasChanges && (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button size="sm" className="wwc:gap-1.5">
							<Upload className="wwc:h-3.5 wwc:w-3.5" />
							Push to {BASE_BRANCH}
							<Badge
								variant="secondary"
								className="wwc:ml-0.5 wwc:h-4 wwc:bg-primary-foreground/20 wwc:px-1.5 wwc:text-[10px] wwc:text-primary-foreground"
							>
								{ahead}
							</Badge>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Push branch to {BASE_BRANCH}?</AlertDialogTitle>
							<AlertDialogDescription>
								This merges all {changeCount} change{changeCount === 1 ? "" : "s"} across {ahead} commit
								{ahead === 1 ? "" : "s"} from <span className="wwc:font-medium wwc:text-foreground">{current}</span>{" "}
								into <span className="wwc:font-medium wwc:text-foreground">{BASE_BRANCH}</span>. This updates the main
								version of the project for everyone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={pushToMain}>Push to {BASE_BRANCH}</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}

			{onBase && (
				<Badge variant="outline" className="wwc:text-muted-foreground">
					base branch
				</Badge>
			)}
		</div>
	);
}

export function AppLayout3Page() {
	const [activeLabel, setActiveLabel] = useState("Overview");
	const [sidebarMode, setSidebarMode] = useState<SidebarMode>("pinned");
	const [selectedProject, setSelectedProject] = useState("All Projects");
	const [settingsTab, setSettingsTab] = useState(SETTINGS_TABS[0]?.id ?? "");

	const viewLevel = selectedProject === "All Projects" ? "org" : "project";
	const [fullscreen, setFullscreen] = useState(false);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
							<h1 className="wwc:text-3xl wwc:font-bold">Branch Layout</h1>
							<CopyButton
								value="Branch Layout"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Layout #2 with branch controls added to the top nav: a branch switcher, an uncommitted-changes count, and
							a <span className="wwc:font-medium">Push to {BASE_BRANCH}</span> action that merges the whole changeset
							into the main version of the project at once.
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
					{/* Top bar — branch controls injected on the right */}
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
						rightContent={<BranchControls />}
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
