import {
	AlertTriangle,
	ArrowRight,
	BarChart3,
	CalendarRange,
	Camera,
	Check,
	ClipboardCheck,
	Cloud,
	Cpu,
	Eye,
	HardHat,
	LayoutGrid,
	Map,
	PenTool,
	Plus,
	Search,
	Sparkles,
	Store,
	TrendingUp,
	Users,
	Video,
	Wallet,
	X,
} from "lucide-react";
import {useMemo, useState} from "react";

import {AppCard} from "../app-card";
import {Badge} from "../badge";
import {Button} from "../button";
import {Dialog, DialogContent, DialogTitle} from "../dialog";
import {Empty} from "../empty";
import type {SidebarNavGroup} from "../navigation/core-app-sidebar";
import {PageContentHeader} from "../page-content-header";
import {toast} from "../sonner";
import {Spinner} from "../spinner";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {toneFor} from "../tones";
import type {ViewTabItem} from "../view-tab-bar";

// The marketplace half of WakeCap Connect, shared by both product releases so there is exactly one
// app catalogue, one install lifecycle and one store surface:
//   • V1 (AppInstaller) — the standalone end-user portal, where the store IS the app.
//   • V2 (WakeCapConnect) — the store merged into the admin workspace as one more surface.
// Everything here is release-agnostic: the catalogue, the install state machine, and the surfaces.
// Which shell they hang in, and what else sits beside them, is the template's business.

export type AppCategory = "workforce" | "safety" | "operations" | "intelligence" | "tools";

export interface MarketApp {
	id: string;
	name: string;
	category: AppCategory;
	icon: React.ComponentType<{className?: string}>;
	blurb: string;
	/** Longer copy shown in the Details dialog. */
	about: string;
	version: string;
}

const CATEGORY_LABEL: Record<AppCategory, string> = {
	workforce: "Workforce",
	safety: "Safety",
	operations: "Operations",
	intelligence: "Intelligence",
	tools: "Tools",
};

export const APPS: MarketApp[] = [
	{
		id: "workforce",
		name: "Workforce",
		category: "workforce",
		icon: Users,
		blurb: "Headcount, crews, OBS, compliance, and a live site map for your workforce.",
		about:
			"Workforce is the command center for everyone on site — live headcount, crews and org breakdown structure, compliance scoring, and a 3D site map that shows who is on each floor in real time.",
		version: "3.4.0",
	},
	{
		id: "safety-manager",
		name: "Safety Manager",
		category: "safety",
		icon: HardHat,
		blurb: "Observations, incidents, and corrective actions across every site.",
		about:
			"Safety Manager captures observations and incidents in the field, routes corrective actions to the right owners, and tracks close-out across every project from one dashboard.",
		version: "2.9.1",
	},
	{
		id: "site-reality",
		name: "Site Reality",
		category: "operations",
		icon: Map,
		blurb: "3D reality models with progress overlays and floor-by-floor isolation.",
		about:
			"Site Reality brings your reality-capture models to life — overlay planned progress, isolate any floor, and compare captures over time to see exactly how the build is advancing.",
		version: "1.6.2",
	},
	{
		id: "clinic",
		name: "Clinic",
		category: "safety",
		icon: ClipboardCheck,
		blurb: "Occupational health and fitness-for-work tracking for site workers.",
		about:
			"Clinic manages occupational health on site — fitness-for-work assessments, medical records, and visit logs so every worker is cleared and accounted for.",
		version: "1.2.0",
	},
	{
		id: "vision-ai",
		name: "Vision AI",
		category: "intelligence",
		icon: Eye,
		blurb: "Automated PPE, access, and hazard detection from your CCTV feeds.",
		about:
			"Vision AI turns your existing CCTV into a safety net — automatically flagging missing PPE, unauthorized access, and site hazards, with alerts routed to the right team.",
		version: "0.9.4",
	},
	{
		id: "cctv",
		name: "CCTV",
		category: "operations",
		icon: Video,
		blurb: "Live and recorded camera streams with timeline scrubbing.",
		about:
			"CCTV unifies every camera on the project — live streams, recorded playback, and timeline scrubbing so you can jump to any moment across any feed.",
		version: "2.1.0",
	},
	{
		id: "progress",
		name: "Progress",
		category: "operations",
		icon: TrendingUp,
		blurb: "Track planned-vs-actual progress with automated capture.",
		about:
			"Progress compares planned versus actual work using automated capture, giving you an objective, up-to-date view of schedule performance across the site.",
		version: "1.8.5",
	},
	{
		id: "reality-capture",
		name: "Reality Capture",
		category: "intelligence",
		icon: Camera,
		blurb: "Schedule and manage 360° reality-capture walks across the project.",
		about:
			"Reality Capture schedules and manages 360° walkthroughs, keeping a time-stamped visual record of the entire project that every other app can build on.",
		version: "1.3.1",
	},
	{
		id: "ai-reports",
		name: "AI Reports",
		category: "intelligence",
		icon: Sparkles,
		blurb: "Generate narrative daily and weekly reports from your site data.",
		about:
			"AI Reports writes your daily and weekly narratives for you — pulling from workforce, safety, and progress data to produce shareable reports in seconds.",
		version: "0.7.0",
	},
	{
		id: "weather",
		name: "Weather Station",
		category: "tools",
		icon: Cloud,
		blurb: "On-site weather, heat-stress indices, and stop-work thresholds.",
		about:
			"Weather Station brings hyper-local conditions to the project — heat-stress indices and configurable stop-work thresholds that keep crews safe and compliant.",
		version: "1.0.3",
	},
	{
		id: "observations",
		name: "Observation Manager",
		category: "safety",
		icon: AlertTriangle,
		blurb: "Log, route, and close out field observations on the go.",
		about:
			"Observation Manager makes it effortless to log a field observation from a phone, route it to the right owner, and track it through to close-out.",
		version: "2.4.0",
	},
	{
		id: "analytics",
		name: "Analytics",
		category: "intelligence",
		icon: BarChart3,
		blurb: "Cross-app dashboards rolling up workforce, safety, and progress.",
		about:
			"Analytics rolls up data from every installed app into cross-project dashboards, so leadership sees workforce, safety, and progress trends in one place.",
		version: "1.1.0",
	},
	{
		id: "equipment",
		name: "Equipment",
		category: "tools",
		icon: Cpu,
		blurb: "Track plant and equipment location, usage, and maintenance.",
		about:
			"Equipment tracks plant and machinery across the site — location, utilization, and maintenance schedules so nothing sits idle or runs overdue.",
		version: "1.5.2",
	},
];

type InstallerTabId = "store" | "installed";

/** Placeholder workspace for an installed app — clickable from the sidebar, empty for now. */
export function AppWorkspace({app}: {app: MarketApp | null}) {
	if (!app) return null;
	const Icon = app.icon;
	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			<Empty
				className="wwc:min-h-[70vh]"
				icon={<Icon className="wwc:h-8 wwc:w-8" />}
				title={app.name}
				description="This app is installed. Its workspace will appear here soon."
			/>
		</div>
	);
}

/** The branded icon tile shared by the App Store cards and the Home shortcuts. */
function appIconTile(app: MarketApp) {
	const Icon = app.icon;
	return (
		<span className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-xl wwc:bg-muted wwc:text-foreground">
			<Icon className="wwc:h-6 wwc:w-6" />
		</span>
	);
}

/** A small green status badge (e.g. "Installed", "New"). */
function statusBadge(label: string) {
	return (
		<Badge className="wwc:h-5 wwc:border-transparent wwc:bg-green-100 wwc:text-[10px] wwc:text-green-700">
			{label}
		</Badge>
	);
}

/** Wrap the matched part of `text` (case-insensitive) in a highlight mark. */
function highlight(text: string, q: string) {
	const query = q.trim();
	if (!query) return text;
	const idx = text.toLowerCase().indexOf(query.toLowerCase());
	if (idx === -1) return text;
	return (
		<>
			{text.slice(0, idx)}
			<mark className="wwc:rounded-[3px] wwc:bg-yellow-200 wwc:text-black">{text.slice(idx, idx + query.length)}</mark>
			{text.slice(idx + query.length)}
		</>
	);
}

/**
 * Home surface — the landing page. With nothing installed it's a welcome hero that nudges the user toward
 * the App Store (via its button or the sidebar plus); once apps exist it becomes a launcher grid.
 */
export function HomeSurface({
	userName,
	installed,
	newIds,
	onBrowse,
	onOpenApp,
	fullWidth = false,
	cardActionVariant = "default",
}: {
	userName: string;
	installed: MarketApp[];
	newIds: Set<string>;
	onBrowse: () => void;
	onOpenApp: (app: MarketApp) => void;
	/** Fill the window instead of holding a centred 1200px measure. */
	fullWidth?: boolean;
	/**
	 * The emphasis of each card's Open button. A launcher grid is a wall of equally-weighted choices,
	 * so `"secondary"` stops a dozen primaries competing for the same attention — there is no single
	 * action here for one of them to be. Defaults to `"default"`, the shape V2 shipped with.
	 */
	cardActionVariant?: "default" | "secondary";
}) {
	if (installed.length === 0) {
		return (
			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
				<Empty
					className="wwc:min-h-[70vh]"
					icon={<LayoutGrid className="wwc:h-8 wwc:w-8" />}
					title={`Welcome, ${userName}`}
					description="WakeCap — the first construction operating system. You don't have any apps yet. Head to the App Store to install your first app, or tap the + in the sidebar anytime."
					action={
						<Button size="lg" className="wwc:gap-2" onClick={onBrowse}>
							<Store className="wwc:h-4 wwc:w-4" />
							Browse the App Store
						</Button>
					}
				/>
			</div>
		);
	}

	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			<div className={`wwc:w-full wwc:space-y-5 wwc:p-6 ${fullWidth ? "" : "wwc:mx-auto wwc:max-w-[1200px]"}`}>
				<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
					<div>
						<h1 className="wwc:text-2xl wwc:font-semibold wwc:tracking-tight">Welcome, {userName}</h1>
						<p className="wwc:mt-1 wwc:text-sm wwc:text-muted-foreground">
							WakeCap — the first construction operating system. Jump into an app, or add more from the App Store.
						</p>
					</div>
					<Button variant="outline" className="wwc:shrink-0 wwc:gap-1.5" onClick={onBrowse}>
						<Store className="wwc:h-4 wwc:w-4" />
						App Store
					</Button>
				</div>

				<div className="wwc:grid wwc:grid-cols-1 wwc:gap-3 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
					{installed.map((app) => (
						<AppCard
							key={app.id}
							icon={appIconTile(app)}
							name={app.name}
							description={app.blurb}
							badge={newIds.has(app.id) ? statusBadge("New") : undefined}
							actions={
								<Button
									size="sm"
									variant={cardActionVariant}
									className="wwc:flex-1 wwc:gap-1.5"
									onClick={() => onOpenApp(app)}
								>
									Open
									<ArrowRight className="wwc:h-3.5 wwc:w-3.5" />
								</Button>
							}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

/** An app-store listing, built on the shared `AppCard`: branded icon tile, an "Installed" badge, a
 *  search-highlighted name, blurb, and a Details / Install (spinner) / Uninstall action row. */
function AppListing({
	app,
	installed,
	installing,
	query,
	onDetails,
	onToggle,
}: {
	app: MarketApp;
	installed: boolean;
	installing: boolean;
	query: string;
	onDetails: () => void;
	onToggle: () => void;
}) {
	return (
		<AppCard
			icon={appIconTile(app)}
			name={highlight(app.name, query)}
			description={app.blurb}
			badge={installed ? statusBadge("Installed") : undefined}
			actions={
				<>
					<Button variant="outline" size="sm" className="wwc:flex-1" onClick={onDetails}>
						Details
					</Button>
					{installing ? (
						<Button variant="outline" size="sm" disabled className="wwc:flex-1 wwc:gap-1.5">
							<Spinner className="wwc:h-3.5 wwc:w-3.5" />
							Installing…
						</Button>
					) : installed ? (
						<Button variant="outline" size="sm" className="wwc:flex-1 wwc:text-muted-foreground" onClick={onToggle}>
							Uninstall
						</Button>
					) : (
						<Button variant="outline" size="sm" className="wwc:flex-1 wwc:gap-1.5" onClick={onToggle}>
							<Plus className="wwc:h-3.5 wwc:w-3.5" />
							Install
						</Button>
					)}
				</>
			}
		/>
	);
}

/** Details dialog for a single app — larger icon, category, version, full copy, and an install toggle. */
export function AppDetailsDialog({
	app,
	installed,
	installing,
	onOpenChange,
	onToggle,
}: {
	app: MarketApp | null;
	installed: boolean;
	installing: boolean;
	onOpenChange: (open: boolean) => void;
	onToggle: () => void;
}) {
	const Icon = app?.icon ?? LayoutGrid;
	return (
		<Dialog open={app !== null} onOpenChange={onOpenChange}>
			<DialogContent closeAlign="padded" className="wwc:p-6 wwc:w-[calc(100vw-2rem)] wwc:max-w-lg">
				{app && (
					<>
						<div className="wwc:flex wwc:items-start wwc:gap-3">
							<div className="wwc:flex wwc:h-14 wwc:w-14 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-2xl wwc:bg-muted wwc:text-foreground">
								<Icon className="wwc:h-7 wwc:w-7" />
							</div>
							<div className="wwc:min-w-0 wwc:flex-1">
								<DialogTitle className="wwc:text-lg wwc:font-semibold">{app.name}</DialogTitle>
								<div className="wwc:mt-0.5 wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:text-muted-foreground">
									<span>{CATEGORY_LABEL[app.category]}</span>
									<span aria-hidden>·</span>
									<span className="wwc:tabular-nums">v{app.version}</span>
									{installed && (
										<Badge className="wwc:h-5 wwc:border-transparent wwc:bg-green-100 wwc:text-[10px] wwc:text-green-700">
											Installed
										</Badge>
									)}
								</div>
							</div>
						</div>

						<p className="wwc:text-sm wwc:text-muted-foreground">{app.about}</p>

						<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2">
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Close
							</Button>
							{installing ? (
								<Button disabled className="wwc:gap-1.5">
									<Spinner className="wwc:h-4 wwc:w-4" />
									Installing…
								</Button>
							) : installed ? (
								<Button variant="outline" className="wwc:text-muted-foreground" onClick={onToggle}>
									Uninstall
								</Button>
							) : (
								<Button className="wwc:gap-1.5" onClick={onToggle}>
									<Plus className="wwc:h-4 wwc:w-4" />
									Install
								</Button>
							)}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ─── Install lifecycle ───────────────────────────────────────────────────────

/**
 * The install state machine, owned in one place so every release behaves identically: install is
 * simulated with a short delay so the button can spin, uninstall is immediate, and opening an app
 * clears its green "new" dot.
 *
 * `initialInstalled` seeds the workspace with apps already in place — a project that has been kitted
 * out rather than a blank one. Those apps are also seeded as already opened, since the green dot marks
 * something the user just added, not something that was always there. Everything else is unchanged:
 * they can be uninstalled from the Marketplace like any other, and reinstalling one brings its dot
 * back. Omit it for the empty first-run state.
 *
 * `onUninstalled` lets the caller react when the app it is currently showing disappears — V1 falls
 * back to Home, the merged releases fall back to Home too.
 */
export function useAppInstallation({
	onUninstalled,
	initialInstalled,
}: {onUninstalled?: (app: MarketApp) => void; initialInstalled?: readonly string[]} = {}) {
	const [installedIds, setInstalledIds] = useState<Set<string>>(() => new Set<string>(initialInstalled));
	// Apps mid-install (button spins) and apps already opened at least once (their "new" green dot clears).
	const [installingIds, setInstallingIds] = useState<Set<string>>(() => new Set<string>());
	const [openedIds, setOpenedIds] = useState<Set<string>>(() => new Set<string>(initialInstalled));
	// The app whose Details dialog is open (or null).
	const [detailsApp, setDetailsApp] = useState<MarketApp | null>(null);

	const isInstalled = (id: string) => installedIds.has(id);
	const installedApps = APPS.filter((a) => isInstalled(a.id));
	const newIds = new Set(installedApps.filter((a) => !openedIds.has(a.id)).map((a) => a.id));

	const markOpened = (app: MarketApp) => setOpenedIds((prev) => new Set(prev).add(app.id));

	const startInstall = (app: MarketApp) => {
		setInstallingIds((prev) => new Set(prev).add(app.id));
		setTimeout(() => {
			setInstallingIds((prev) => {
				const next = new Set(prev);
				next.delete(app.id);
				return next;
			});
			setInstalledIds((prev) => new Set(prev).add(app.id));
			toast.success(`${app.name} installed`);
		}, 1400);
	};

	const uninstall = (app: MarketApp) => {
		setInstalledIds((prev) => {
			const next = new Set(prev);
			next.delete(app.id);
			return next;
		});
		// Forget it was opened, so a later reinstall shows the green "new" dot again.
		setOpenedIds((prev) => {
			const next = new Set(prev);
			next.delete(app.id);
			return next;
		});
		toast.success(`${app.name} uninstalled`);
		onUninstalled?.(app);
	};

	const toggleInstall = (app: MarketApp) => {
		if (installedIds.has(app.id)) uninstall(app);
		else if (!installingIds.has(app.id)) startInstall(app);
	};

	return {
		installedIds,
		installingIds,
		installedApps,
		newIds,
		isInstalled,
		markOpened,
		toggleInstall,
		detailsApp,
		setDetailsApp,
	};
}

/**
 * The installed apps as a sidebar group, with a green dot on anything not yet opened. Both releases
 * pin this above their own nav — it is the top section of the sidebar in V1 and V2 alike. Returns an
 * empty array while nothing is installed, so `CoreAppSidebar` renders no stray divider.
 */
export function installedAppsGroup(
	installedApps: MarketApp[],
	newIds: Set<string>,
	label = "Your apps",
): SidebarNavGroup[] {
	if (installedApps.length === 0) return [];
	return [
		{
			label,
			items: installedApps.map((a) => ({
				id: `app-${a.id}`,
				label: a.name,
				icon: a.icon,
				dot: newIds.has(a.id) ? "wwc:bg-green-500" : undefined,
			})),
		},
	];
}

// ─── Lifecycle grouping ──────────────────────────────────────────────────────

/** The four stages of the project lifecycle Connect organises its apps by. */
export const APP_LIFECYCLE_STAGES = ["Design", "Plan", "Capture", "Pay"] as const;
export type AppLifecycleStage = (typeof APP_LIFECYCLE_STAGES)[number];

/**
 * One icon per stage. It labels the group in the expanded sidebar and, in the collapsed rail, stands
 * for the whole stage — the group becomes this single icon, and its apps move into the flyout behind
 * it.
 */
export const APP_LIFECYCLE_ICONS: Record<AppLifecycleStage, React.ComponentType<{className?: string}>> = {
	Design: PenTool,
	Plan: CalendarRange,
	Capture: Camera,
	Pay: Wallet,
};

/**
 * Stage order, so each stage starts at a different point in the tone rotation and two stages stacked
 * in the rail do not both open on the same hue. The tones themselves live in `../tones` — one palette
 * for the whole library — and `toneFor` guarantees that consecutive items in a stage are never
 * neighbouring hues.
 *
 * Spread by 5 rather than 1: a stage has at most a handful of apps, so stepping the START by more than
 * any one stage consumes keeps the stages from overlapping into each other's stretch of the wheel.
 *
 * V2's flat "Your apps" list stays untinted — with no stages to tell apart, a hue there carries no
 * meaning.
 */
const STAGE_TONE_OFFSET: Record<AppLifecycleStage, number> = {
	Design: 0,
	Plan: 5,
	Capture: 10,
	Pay: 15,
};

/**
 * Which lifecycle stage each catalogue app belongs to: define the project (Design), schedule and
 * forecast it (Plan), record what actually happened on site (Capture), then settle the people and
 * hours behind it (Pay). A provisional placement — the stage is nav metadata, not behaviour, so
 * moving an app between stages is a one-line edit here.
 */
export const APP_LIFECYCLE: Record<string, AppLifecycleStage> = {
	"site-reality": "Design",
	equipment: "Design",
	progress: "Plan",
	analytics: "Plan",
	"ai-reports": "Plan",
	weather: "Plan",
	"reality-capture": "Capture",
	cctv: "Capture",
	"vision-ai": "Capture",
	observations: "Capture",
	"safety-manager": "Capture",
	workforce: "Pay",
	clinic: "Pay",
};

/**
 * The apps a Connect workspace opens with — a project already kitted out rather than a blank one, so
 * every lifecycle stage has something under it on first load. Deliberately not the whole catalogue:
 * what is left over is what the Marketplace has to offer, and any of these can be uninstalled there.
 */
export const CONNECT_STARTER_APPS = [
	"site-reality", // Design
	"equipment", // Design
	"progress", // Plan
	"analytics", // Plan
	"cctv", // Capture
	"vision-ai", // Capture
	"safety-manager", // Capture
	"workforce", // Pay
	"clinic", // Pay
] as const;

/**
 * Installed apps as one labelled sidebar group per lifecycle stage, in stage order. Stages with
 * nothing installed are omitted entirely, so the sidebar grows a section only once it has something
 * to show — and `CoreAppSidebar` never draws a divider around an empty group.
 */
export function lifecycleAppGroups(installedApps: MarketApp[], newIds: Set<string>): SidebarNavGroup[] {
	return APP_LIFECYCLE_STAGES.flatMap((stage) => {
		const items = installedApps
			.filter((a) => APP_LIFECYCLE[a.id] === stage)
			.map((a, i) => ({
				id: `app-${a.id}`,
				label: a.name,
				icon: a.icon,
				tone: toneFor(i, STAGE_TONE_OFFSET[stage]),
				dot: newIds.has(a.id) ? "wwc:bg-green-500" : undefined,
			}));
		return items.length > 0
			? [
					{
						id: `${STAGE_GROUP_PREFIX}${stage}`,
						label: stage,
						icon: APP_LIFECYCLE_ICONS[stage],
						collapsible: true,
						items,
					},
				]
			: [];
	});
}

/** Group id prefix for a lifecycle stage header, so a click can be resolved back to its stage. */
export const STAGE_GROUP_PREFIX = "stage-";

/** The stage a group id names, or null if it is not a stage header. */
export function stageFromGroupId(groupId: string): AppLifecycleStage | null {
	const stage = groupId.startsWith(STAGE_GROUP_PREFIX) ? groupId.slice(STAGE_GROUP_PREFIX.length) : null;
	return APP_LIFECYCLE_STAGES.find((s) => s === stage) ?? null;
}

const STAGE_BLURB: Record<AppLifecycleStage, string> = {
	Design:
		"Define the project and the model everything else hangs off — the site, its assets, and how they are laid out.",
	Plan: "Schedule the work, forecast it, and report on how it is tracking against the plan.",
	Capture: "Record what actually happened on site, from camera feeds and automated detection to field observations.",
	Pay: "Settle the people behind the work — who was on site, whether they were cleared to be, and what they are owed.",
};

/**
 * The page behind a lifecycle stage's name in the sidebar: what the stage is for, and the apps
 * installed under it. Clicking the group name opens this; the chevron beside it just folds the list.
 */
export function StageSurface({
	stage,
	installed,
	newIds,
	onOpenApp,
	onBrowse,
	fullWidth = false,
}: {
	fullWidth?: boolean;
	stage: AppLifecycleStage;
	installed: MarketApp[];
	newIds: Set<string>;
	onOpenApp: (app: MarketApp) => void;
	onBrowse: () => void;
}) {
	const StageIcon = APP_LIFECYCLE_ICONS[stage];
	const apps = installed.filter((a) => APP_LIFECYCLE[a.id] === stage);
	const available = APPS.filter((a) => APP_LIFECYCLE[a.id] === stage && !apps.some((i) => i.id === a.id));

	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			<div className={`wwc:w-full wwc:space-y-5 wwc:p-6 ${fullWidth ? "" : "wwc:mx-auto wwc:max-w-[1200px]"}`}>
				<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
					<div className="wwc:flex wwc:items-start wwc:gap-3">
						<div className="wwc:flex wwc:h-11 wwc:w-11 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-xl wwc:bg-muted wwc:text-foreground">
							<StageIcon className="wwc:h-5 wwc:w-5" />
						</div>
						<div className="wwc:min-w-0">
							<h1 className="wwc:text-2xl wwc:font-semibold wwc:tracking-tight">{stage}</h1>
							<p className="wwc:mt-1 wwc:max-w-[70ch] wwc:text-sm wwc:text-muted-foreground">{STAGE_BLURB[stage]}</p>
						</div>
					</div>
					<Button variant="outline" className="wwc:shrink-0 wwc:gap-1.5" onClick={onBrowse}>
						<Store className="wwc:h-4 wwc:w-4" />
						Marketplace
					</Button>
				</div>

				<div className="wwc:grid wwc:grid-cols-1 wwc:gap-3 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
					{apps.map((app) => (
						<AppCard
							key={app.id}
							icon={appIconTile(app)}
							name={app.name}
							description={app.blurb}
							badge={newIds.has(app.id) ? statusBadge("New") : undefined}
							actions={
								<Button size="sm" className="wwc:flex-1 wwc:gap-1.5" onClick={() => onOpenApp(app)}>
									Open
									<ArrowRight className="wwc:h-3.5 wwc:w-3.5" />
								</Button>
							}
						/>
					))}
				</div>

				{available.length > 0 && (
					<p className="wwc:text-sm wwc:text-muted-foreground">
						{available.length} more {stage} app{available.length === 1 ? "" : "s"} available in the Marketplace:{" "}
						{available.map((a) => a.name).join(", ")}.
					</p>
				)}
			</div>
		</div>
	);
}

// ─── Store surface ───────────────────────────────────────────────────────────

/**
 * The App Store itself: two tabs (App Store / Installed Apps), a search box with match highlighting,
 * scrollable category pills, and the grid of app cards. It renders the surface only — no shell — so a
 * template can drop it into whatever `main` it already owns.
 */
export function MarketplaceSurface({
	title = "App Store",
	isInstalled,
	installingIds,
	installedCount,
	onDetails,
	onToggle,
	onTabChange,
	fullWidth = false,
}: {
	fullWidth?: boolean;
	title?: string;
	isInstalled: (id: string) => boolean;
	installingIds: Set<string>;
	installedCount: number;
	onDetails: (app: MarketApp) => void;
	onToggle: (app: MarketApp) => void;
	/** Reports the active tab's LABEL so a shell can carry it into its breadcrumb, the way every other
	 *  surface's tab shows up there. */
	onTabChange?: (tabLabel: string) => void;
}) {
	const [activeTab, setActiveTab] = useState<InstallerTabId>("store");
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<AppCategory | "all">("all");

	const TABS: readonly ViewTabItem<InstallerTabId>[] = [
		{id: "store", label: "App Store", icon: Store},
		{id: "installed", label: "Installed Apps", icon: Check, badge: installedCount || undefined},
	];

	const CATEGORIES: {value: AppCategory | "all"; label: string}[] = [
		{value: "all", label: "All"},
		{value: "workforce", label: "Workforce"},
		{value: "safety", label: "Safety"},
		{value: "operations", label: "Operations"},
		{value: "intelligence", label: "Intelligence"},
		{value: "tools", label: "Tools"},
	];

	const visibleApps = useMemo(() => {
		const q = query.trim().toLowerCase();
		return APPS.filter((app) => {
			if (activeTab === "installed" && !isInstalled(app.id)) return false;
			if (category !== "all" && app.category !== category) return false;
			if (q && !(app.name.toLowerCase().includes(q) || app.blurb.toLowerCase().includes(q))) return false;
			return true;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab, query, category, isInstalled]);

	return (
		<>
			<PageContentHeader
				variant="navigation"
				title={title}
				tabs={TABS}
				activeTab={activeTab}
				onTabChange={(tab) => {
					setActiveTab(tab as InstallerTabId);
					onTabChange?.(TABS.find((t) => t.id === tab)?.label ?? "");
				}}
			/>

			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
				<div className={`wwc:w-full wwc:space-y-4 wwc:p-6 ${fullWidth ? "" : "wwc:mx-auto wwc:max-w-[1200px]"}`}>
					{/* Search (left) + scrollable category pills (right) */}
					<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:md:flex-row wwc:md:items-center">
						<div className="wwc:flex wwc:h-9 wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:bg-muted/50 wwc:px-3 wwc:transition-colors wwc:focus-within:bg-muted wwc:md:w-72 wwc:md:shrink-0">
							<Search className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search apps…"
								className="wwc:flex-1 wwc:border-0 wwc:bg-transparent wwc:text-sm wwc:outline-none wwc:placeholder:text-muted-foreground"
							/>
							{query && (
								<button
									type="button"
									onClick={() => setQuery("")}
									aria-label="Clear search"
									className="wwc:flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:text-muted-foreground wwc:hover:text-foreground"
								>
									<X className="wwc:h-3.5 wwc:w-3.5" />
								</button>
							)}
						</div>

						<div className="wwc:min-w-0 wwc:flex-1 wwc:overflow-x-auto">
							<ToggleGroup
								type="single"
								variant="outline"
								value={category}
								onValueChange={(v) => v && setCategory(v as AppCategory | "all")}
								className="wwc:w-max wwc:flex-nowrap wwc:justify-start wwc:gap-1.5"
							>
								{CATEGORIES.map((c) => (
									<ToggleGroupItem
										key={c.value}
										value={c.value}
										className="wwc:h-8 wwc:shrink-0 wwc:px-2.5 wwc:text-xs wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary wwc:data-[state=on]:text-primary-foreground"
									>
										{c.label}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
					</div>

					{/* App grid */}
					{visibleApps.length === 0 ? (
						<div className="wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
							<Empty
								icon={<LayoutGrid className="wwc:h-6 wwc:w-6" />}
								title="No apps found"
								description={
									activeTab === "installed"
										? "You haven't installed any apps yet — browse the App Store to add one."
										: "No apps match your search or category filter."
								}
							/>
						</div>
					) : (
						<div className="wwc:grid wwc:grid-cols-1 wwc:gap-3 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
							{visibleApps.map((app) => (
								<AppListing
									key={app.id}
									app={app}
									installed={isInstalled(app.id)}
									installing={installingIds.has(app.id)}
									query={query}
									onDetails={() => onDetails(app)}
									onToggle={() => onToggle(app)}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}
