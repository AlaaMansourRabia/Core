import type {ViewTabItem} from "@corensystem/coren-ui/view-tab-bar";

import {Button} from "@corensystem/coren-ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Empty} from "@corensystem/coren-ui/empty";
import {CoreAppSidebar, type SidebarNavGroup} from "@corensystem/coren-ui/navigation/core-app-sidebar";
import {CoreAppTopBar} from "@corensystem/coren-ui/navigation/core-app-top-bar";
import {ProgressDetails} from "@corensystem/coren-ui/pages/core-progress-details";
import {SideMenu, type SideMenuGroup} from "@corensystem/coren-ui/side-menu";
import {cn} from "@corensystem/coren-utils";
import {
	Activity,
	BarChart3,
	Calculator,
	Camera,
	ChevronDown,
	ClipboardCheck,
	ClipboardList,
	CreditCard,
	FileDown,
	FileText,
	GraduationCap,
	Hammer,
	LayoutGrid,
	ListChecks,
	type LucideIcon,
	Map,
	MapPin,
	Maximize2,
	Minimize2,
	Settings,
	TrendingUp,
} from "lucide-react";
import {useState} from "react";

import {BoqViewer} from "./boq-viewer";
import {SiteView} from "./site-view";

// Capture — the capture template scaffold, cloned from the Workforce skeleton for navigation.
// Same shell as Safety Manager (CoreAppSidebar + CoreAppTopBar + PageContentHeader) with a
// single "Capture" sidebar entry. The content area toggles between the route header
// (Analytics / Workers List / Submissions / Compliance tabs + a Settings action) and a Settings
// sub-surface (SideMenu + content). Tab and setting bodies are placeholders until the real
// capture surfaces land. The top bar breadcrumb tracks the active content.

type SidebarNavItemLite = {id: string; label: string; icon: React.ComponentType<{className?: string}>};

const NAV_ITEMS: SidebarNavItemLite[] = [{id: "capture", label: "Capture", icon: Camera}];

const CAPTURE_GROUPS: SidebarNavGroup[] = [{items: NAV_ITEMS}];

type CaptureTabId = "site" | "progress-details" | "progress-work-done" | "reports";

const TABS: ViewTabItem<CaptureTabId>[] = [
	{id: "site", label: "Site", icon: Map},
	{id: "progress-details", label: "Progress Details", icon: Activity},
	{id: "progress-work-done", label: "Progress work done", icon: ListChecks},
	{id: "reports", label: "Reports", icon: FileText},
];

// The two right-hand tabs ("Progress work done", "Reports") act as dropdowns: clicking one opens a
// menu of sub-views. "Progress" maps to the ProgressDetails template; the rest are placeholders.
interface SubItem {
	id: string;
	label: string;
	icon: LucideIcon;
}

const PROGRESS_ITEMS: SubItem[] = [
	{id: "boq", label: "BOQ Viewer", icon: Calculator},
	{id: "progress", label: "Progress", icon: ClipboardList},
	{id: "earned-value", label: "Earned Value", icon: TrendingUp},
	{id: "earned-value-division", label: "Earned Value by Division", icon: BarChart3},
	{id: "dashboard", label: "Dashboard", icon: LayoutGrid},
];

const REPORTS_ITEMS: SubItem[] = [
	{id: "milestone", label: "Milestone", icon: FileText},
	{id: "rega", label: "REGA", icon: FileText},
	{id: "updated-by-villa", label: "Updated by Villa", icon: FileText},
	{id: "downloads", label: "Downloads", icon: FileDown},
];

const findSub = (items: SubItem[], id: string) => items.find((item) => item.id === id) ?? items[0];

type SettingId = "trade" | "workshifts" | "discipline" | "location-group" | "card-generator";

const SETTINGS_GROUPS: SideMenuGroup[] = [
	{
		items: [
			{id: "trade", label: "Trade", icon: Hammer},
			{id: "workshifts", label: "Workshifts", icon: ClipboardCheck},
			{id: "discipline", label: "Discipline", icon: GraduationCap},
			{id: "location-group", label: "Location Group", icon: MapPin},
			{id: "card-generator", label: "Card Generator", icon: CreditCard},
		],
	},
];

const SETTINGS_ITEMS = SETTINGS_GROUPS.flatMap((group) => group.items);

const SETTING_PLACEHOLDER: Record<SettingId, string> = {
	trade: "Define the trades workers can be assigned to.",
	workshifts: "Configure shift patterns, rosters, and working hours.",
	discipline: "Manage disciplines and how workers are grouped by them.",
	"location-group": "Group site locations for reporting and assignment.",
	"card-generator": "Configure worker ID card templates and issuing rules.",
};

const settingLabel = (id: string) => SETTINGS_ITEMS.find((item) => item.id === id)?.label ?? "Settings";
const tabLabel = (id: CaptureTabId) => TABS.find((tab) => tab.id === id)?.label ?? "";

// Underline tab styling, matching ViewTabBar's `underline` + `fill` variant.
const tabClass = (active: boolean) =>
	cn(
		"wwc:flex wwc:h-full wwc:items-center wwc:gap-1.5 wwc:border-b-2 wwc:px-3 wwc:text-xs wwc:font-medium wwc:transition-all",
		active
			? "wwc:border-primary wwc:text-foreground"
			: "wwc:border-transparent wwc:text-muted-foreground wwc:hover:bg-accent/50 wwc:hover:text-foreground",
	);

/** A tab that opens a dropdown menu of sub-views (matching the reference menus). */
function DropdownTab({
	label,
	icon: Icon,
	items,
	active,
	activeSub,
	onSelect,
}: {
	label: string;
	icon: LucideIcon;
	items: SubItem[];
	active: boolean;
	activeSub: string;
	onSelect: (subId: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className={tabClass(active)}>
					<Icon size={14} />
					{label}
					<ChevronDown size={12} className="wwc:opacity-60" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="wwc:w-64">
				<div className="wwc:px-2 wwc:py-1">
					<span className="wwc:text-sm wwc:font-semibold">{label}</span>
				</div>
				<DropdownMenuSeparator />
				{items.map((item) => (
					<DropdownMenuItem
						key={item.id}
						className={cn("wwc:gap-2", active && activeSub === item.id && "wwc:bg-accent wwc:font-semibold")}
						onSelect={() => onSelect(item.id)}
					>
						<item.icon className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Placeholder body for a selected dropdown sub-view. */
function SubView({item}: {item: SubItem}) {
	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:p-6">
				<div className="wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
					<Empty
						icon={<item.icon className="wwc:h-6 wwc:w-6" />}
						title={item.label}
						description={`${item.label} will appear here.`}
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * Capture template scaffold. Renders its own app shell and a content area. The route header has two
 * a plain Site tab and two dropdown tabs (Progress work done, Reports) that open a menu
 * of sub-views, plus a Settings action that opens a SideMenu sub-surface.
 */
export function Capture() {
	const [mode, setMode] = useState<"default" | "settings">("default");
	// Fullscreen focuses the workspace: the sidebar and the site top bar drop away, leaving only the
	// Capture nav tab header and the content beneath it.
	const [fullscreen, setFullscreen] = useState(false);
	const [activeTab, setActiveTab] = useState<CaptureTabId>("site");
	const [activeSetting, setActiveSetting] = useState<SettingId>("trade");
	// Selected sub-view for each dropdown tab.
	const [progressSub, setProgressSub] = useState("progress");
	const [reportsSub, setReportsSub] = useState("milestone");

	const activeSettingLabel = settingLabel(activeSetting);

	const breadcrumb =
		mode === "settings" ? `Capture / Settings / ${activeSettingLabel}` : `Capture / ${tabLabel(activeTab)}`;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			{!fullscreen && (
				<CoreAppSidebar
					viewLevel="org"
					orgGroups={CAPTURE_GROUPS}
					activeItemId="capture"
					showSearch={false}
					showNotifications={false}
				/>
			)}

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				{!fullscreen && (
					<CoreAppTopBar activeLabel={breadcrumb} showProjectSwitcher={false} showNotifications notificationCount={3} />
				)}

				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
					{mode === "default" ? (
						<>
							<header className="wwc:flex wwc:min-h-12 wwc:w-full wwc:items-stretch wwc:justify-between wwc:gap-2 wwc:border-b wwc:bg-card wwc:px-3">
								<div className="wwc:flex wwc:min-w-0 wwc:items-stretch wwc:gap-3">
									<h1 className="wwc:shrink-0 wwc:self-center wwc:truncate wwc:text-sm wwc:font-semibold">Capture</h1>
									<nav className="wwc:flex wwc:items-stretch wwc:gap-1">
										<button
											type="button"
											className={tabClass(activeTab === "site")}
											onClick={() => setActiveTab("site")}
										>
											<Map size={14} />
											Site
										</button>
										<button
											type="button"
											className={tabClass(activeTab === "progress-details")}
											onClick={() => setActiveTab("progress-details")}
										>
											<Activity size={14} />
											Progress Details
										</button>
										<DropdownTab
											label="Progress work done"
											icon={ListChecks}
											items={PROGRESS_ITEMS}
											active={activeTab === "progress-work-done"}
											activeSub={progressSub}
											onSelect={(subId) => {
												setActiveTab("progress-work-done");
												setProgressSub(subId);
											}}
										/>
										<DropdownTab
											label="Reports"
											icon={FileText}
											items={REPORTS_ITEMS}
											active={activeTab === "reports"}
											activeSub={reportsSub}
											onSelect={(subId) => {
												setActiveTab("reports");
												setReportsSub(subId);
											}}
										/>
									</nav>
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<Button
										variant="outline"
										icon
										size="sm"
										aria-label={fullscreen ? "Exit full screen" : "Full screen"}
										aria-pressed={fullscreen}
										onClick={() => setFullscreen((value) => !value)}
									>
										{fullscreen ? <Minimize2 className="wwc:h-4 wwc:w-4" /> : <Maximize2 className="wwc:h-4 wwc:w-4" />}
									</Button>
									<Button variant="outline" icon size="sm" aria-label="Settings" onClick={() => setMode("settings")}>
										<Settings className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
							</header>

							{activeTab === "site" ? (
								// Site — the site model (UE22 auto-loaded); clicking a model part zooms into the
								// house-level BIM view with that floor preselected. Fills the height below the header.
								<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-hidden">
									<SiteView />
								</div>
							) : activeTab === "progress-details" ? (
								// Progress Details — the design-system ProgressDetails workspace template (its own tab).
								<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-hidden">
									<ProgressDetails />
								</div>
							) : activeTab === "progress-work-done" ? (
								// Progress work done — dropdown sub-views. BOQ Viewer is built out; the rest are placeholders.
								progressSub === "boq" ? (
									<BoqViewer />
								) : (
									<SubView item={findSub(PROGRESS_ITEMS, progressSub)} />
								)
							) : (
								// Reports — placeholder sub-views.
								<SubView item={findSub(REPORTS_ITEMS, reportsSub)} />
							)}
						</>
					) : (
						<div className="wwc:flex wwc:min-h-0 wwc:flex-1">
							<SideMenu
								title="Settings"
								onBack={() => setMode("default")}
								backLabel="Back to Capture"
								showSearch={false}
								groups={SETTINGS_GROUPS}
								activeItemId={activeSetting}
								onItemSelect={(id) => setActiveSetting(id as SettingId)}
							/>

							<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
								<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1000px] wwc:p-6">
									<h1 className="wwc:text-xl wwc:font-semibold wwc:tracking-tight">{activeSettingLabel}</h1>
									<div className="wwc:mt-4 wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
										<Empty
											icon={<Settings className="wwc:h-6 wwc:w-6" />}
											title={activeSettingLabel}
											description={SETTING_PLACEHOLDER[activeSetting]}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
