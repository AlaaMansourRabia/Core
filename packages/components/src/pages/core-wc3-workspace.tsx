import {
	Blocks,
	Bookmark,
	Box,
	Boxes,
	Bell,
	ClipboardList,
	Compass,
	Database,
	Dna,
	Folder,
	FolderTree,
	HeartPulse,
	House,
	Layers,
	LayoutGrid,
	Link2,
	Network,
	Package,
	Play,
	Puzzle,
	Radar,
	Radio,
	Settings,
	Share2,
	Store,
	ShieldCheck,
	SlidersHorizontal,
	Table2,
	TrendingUp,
	Workflow,
	Zap,
} from "lucide-react";
import {useCallback, useState} from "react";

import {ActivitySheet} from "../activity-sheet";
import {Button} from "../button";
import {CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "../command";
import {Empty} from "../empty";
import {FileSystem, type FileSystemNode} from "../file-system";
import {CoreAppSidebar, type SidebarNavGroup} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {NotificationCenter, type ChangeEntry, type NotificationItem} from "../notification-center";
import {PageContentHeader} from "../page-content-header";
import {SideMenu, type SideMenuGroup} from "../side-menu";
import {Toaster} from "../sonner";
import {NEUTRAL_TONE, TONE_BY_ID} from "../tones";
import {usePersistentState} from "../use-persistent-state";
import type {ViewTabItem} from "../view-tab-bar";
import {
	AppDetailsDialog,
	APPS,
	AppWorkspace,
	HomeSurface,
	installedAppsGroup,
	APP_LIFECYCLE,
	lifecycleAppGroups,
	MarketplaceSurface,
	stageFromGroupId,
	StageSurface,
	useAppInstallation,
	type AppLifecycleStage,
	type MarketApp,
} from "./app-marketplace-shared";
import {ANALYSIS_VIEWS, seedAnalysisSession} from "./wc3-analysis-views";
import {WC3_ORGANIZATIONS} from "./wc3-fs-data";
import {Wc3FsLocationField, wc3FsDefaultLocation} from "./wc3-fs-location-field";
import {createActionTypeNamed, createObjectTypeNamed, fsRefFor} from "./wc3-fs-records";
import {useWc3FsNodes, wc3Fs, wc3FsCreate, wc3FsRootByName} from "./wc3-fs-store";
import {WC3_ALL_FILE_TYPES, isWc3Ref, type Wc3FsRef} from "./wc3-fs-types";
import {HomeView, type Wc3HomeCard} from "./wc3-home-view";
import {WC3_NODE_KINDS, WC3_PIPELINES} from "./wc3-lineage-data";
import {LINEAGE_VIEWS, type Wc3LineageNavTarget} from "./wc3-lineage-views";
import {
	WC3_ACTION_TYPES,
	WC3_INTERFACES,
	WC3_LINK_TYPES,
	WC3_OBJECT_TYPES,
	WC3_SHARED_PROPERTIES,
	WC3_TYPE_GROUPS,
} from "./wc3-ontology-data";
import {ONTOLOGY_VIEWS, runOntologyLint} from "./wc3-ontology-views";
import {createPipeline, WC3_PIPELINE_ICONS} from "./wc3-pipeline-shared";
import {PIPELINE_VIEWS, seedPipelines} from "./wc3-pipeline-views";
import {WC3_PROCESSES} from "./wc3-process-data";
import {createProcess} from "./wc3-process-shared";
import {PROCESS_VIEWS, seedProcesses} from "./wc3-process-views";
import {WC3_PRODUCTS} from "./wc3-product-data";
import {PRODUCT_VIEWS} from "./wc3-product-views";

// WC3 Workspace — the app-shell skeleton for the "unified workspace" ontology-manager prototype.
// Every perspective in the prototype's rail is a sidebar item. Each perspective is a Default view
// (PageContentHeader tabs + a Settings action) and a Settings sub-surface (SideMenu + content), the
// same two-mode shape as Workforce / Safety Manager / Clinic. Every tab body is a placeholder.

// ─── Perspectives ────────────────────────────────────────────────────────────

type Perspective = {
	id: string;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	tabs: ViewTabItem<string>[];
	/** Placeholder copy per tab id — what will eventually live on that surface. */
	placeholders: Record<string, string>;
};

const PERSPECTIVES: Perspective[] = [
	{
		id: "home",
		label: "Home",
		icon: House,
		// One tab, and no placeholder: the landing cards ARE the content, and they are derived from
		// the perspectives below rather than listed again here.
		tabs: [{id: "overview", label: "Overview", icon: LayoutGrid}],
		placeholders: {},
	},
	{
		id: "analysis",
		label: "Analysis",
		icon: TrendingUp,
		tabs: [
			{id: "object", label: "Object analysis", icon: Boxes},
			{id: "data", label: "Data analysis", icon: Table2},
			{id: "saved", label: "Saved analyses", icon: Bookmark},
		],
		placeholders: {
			object: "The stage path over an ontology object set — source, filter, traverse, derive — will appear here.",
			data: "The stage path over a governed dataset, joined and aggregated, will appear here.",
			saved: "Saved analyses with their spec, route, and lineage will appear here.",
		},
	},
	{
		id: "processes",
		label: "Processes",
		icon: Workflow,
		// The perspective's top level is the LIST of processes. `canvas`, `instances`, `bottlenecks` and
		// `editor` used to sit here as four placeholder tabs; in the prototype (PageProcesses, line 7195)
		// they are all facets of ONE process — its graph, its token panel, its SLA/aging panel and its
		// editor panel — so they moved into wc3-process-detail.tsx behind a SideMenu. Same correction the
		// Products perspective already took when six tabs became PRODUCT_TABS.
		//
		// lineageNav.process() in wc3-lineage-shared.tsx:39 is retargeted to "processes" in the SAME
		// change: the guard below silently DECLINES an unknown tab id, so a stale "canvas" would be an
		// invisible dead link rather than an error.
		//
		// The badge reads the frozen fixture, so a process created in-session does not bump the 2 — the
		// same staleness the Ontology and Pipelines tabs already ship.
		tabs: [{id: "processes", label: "Processes", icon: Workflow, badge: WC3_PROCESSES.length}],
		placeholders: {
			processes: "The process catalogue — state machines bound to ontology object types — will appear here.",
		},
	},
	{
		id: "pipelines",
		label: "Pipelines",
		icon: Share2,
		// Tab ids ARE the PIPELINE_VIEWS keys. `builder` is gone on purpose: the user-facing entry
		// point is the pipeline list, and the typed-port canvas is that list's drill-in, not a tab.
		// lineageNav.pipeline() in wc3-lineage-shared.tsx:34 was retargeted to "pipelines" in the
		// same change — the shell's guard below would otherwise silently decline the tab switch.
		// The badges read the frozen fixture, so a pipeline created in-session does not bump the 3.
		// That staleness is the existing house behaviour (the ontology tabs badge WC3_OBJECT_TYPES
		// while its wizard creates types in-session); Runs carries no badge at all, because a
		// hardcoded 0 would still read 0 after a run.
		tabs: [
			{id: "pipelines", label: "Pipelines", icon: Share2, badge: WC3_PIPELINES.length},
			{id: "palette", label: "Palette", icon: Blocks, badge: Object.keys(WC3_NODE_KINDS).length},
			{id: "runs", label: "Runs", icon: Play},
		],
		placeholders: {
			pipelines: "The pipeline catalogue will appear here.",
			palette: "Sources, transforms, and sinks grouped by discipline will appear here.",
			runs: "Pipeline runs with per-node row counts will appear here.",
		},
	},
	{
		id: "products",
		label: "Products",
		icon: Package,
		// The perspective's top level is the CATALOGUE of first-party products. `outputs`,
		// `permissions`, `evidence`, `dependencies`, `readiness` and `installs` used to sit here as
		// tabs; in the prototype (PageProducts, line 11159) they are PRODUCT_TABS — the sections of a
		// SINGLE product's detail page — so they moved into wc3-product-detail.tsx behind a SideMenu.
		tabs: [{id: "catalogue", label: "Catalogue", icon: Package, badge: WC3_PRODUCTS.length}],
		placeholders: {
			catalogue: "The 17-product first-party Core catalogue will appear here.",
		},
	},
	{
		id: "lineage",
		label: "Lineage",
		icon: Network,
		tabs: [
			{id: "data", label: "Data lineage", icon: Compass},
			{id: "workflow", label: "Workflow lineage", icon: Zap},
			{id: "impact", label: "Impact (what-if)", icon: Radar},
		],
		placeholders: {
			data: "The datasource → pipeline → object type → projection DAG will appear here.",
			workflow: "An action run, the rules it fired, and its side effects will appear here.",
			impact: "The blast radius of a change across pipelines, processes, and actions will appear here.",
		},
	},
	{
		id: "ontology",
		label: "Ontology",
		icon: Layers,
		// Counts derive from the fixture, the way the prototype's rail derives them from its store.
		tabs: [
			{id: "object-types", label: "Object types", icon: Box, badge: WC3_OBJECT_TYPES.length},
			{id: "link-types", label: "Link types", icon: Link2, badge: WC3_LINK_TYPES.length},
			{id: "action-types", label: "Action types", icon: Zap, badge: WC3_ACTION_TYPES.length},
			{id: "interfaces", label: "Interfaces", icon: Dna, badge: WC3_INTERFACES.length},
			{id: "shared-properties", label: "Shared properties", icon: Puzzle, badge: WC3_SHARED_PROPERTIES.length},
			{id: "groups", label: "Groups", icon: Folder, badge: WC3_TYPE_GROUPS.length},
			{id: "graph", label: "Graph explorer", icon: Network, badge: WC3_LINK_TYPES.length},
			{id: "health", label: "Health", icon: HeartPulse, badge: runOntologyLint().length},
		],
		placeholders: {
			"object-types": "The object types in the shared ontology will appear here.",
			"link-types": "How object types relate to one another will appear here.",
			"action-types": "The actions that can be run against objects will appear here.",
			interfaces: "Shared interfaces and their implementors will appear here.",
			"shared-properties": "Properties reused across object types will appear here.",
			groups: "Type groups will appear here.",
			graph: "The graph explorer over the ontology will appear here.",
			health: "Ontology lint findings will appear here.",
		},
	},
];

const WORKSPACE_GROUPS: SidebarNavGroup[] = [
	// The prototype's rail is flat — one ungrouped list, in rail order.
	{items: PERSPECTIVES.map((p) => ({id: p.id, label: p.label, icon: p.icon}))},
];

// Fixtures for the notification centre. The changeset mirrors the prototype's change log: every
// ontology mutation lands there uncommitted until applied or discarded as one set.
const SEED_NOTIFICATIONS: NotificationItem[] = [
	{
		id: "n1",
		title: "Pipeline run finished",
		body: "BIM ingest upserted 2 new elements",
		time: "2m ago",
		unread: true,
		kind: "Pipelines",
		tone: "success",
	},
	{
		id: "n2",
		title: "Permit PT-706 suspended",
		body: "Zone still shows 10 workers on site",
		time: "18m ago",
		unread: true,
		kind: "Safety",
		tone: "danger",
	},
	{
		id: "n3",
		title: "Ontology lint: 1 error",
		body: "Direct Schema Translation on Lint Demo: Badge Events Raw Table",
		time: "1h ago",
		unread: true,
		kind: "Health",
		tone: "warning",
	},
	{
		id: "n4",
		title: "Product installed",
		body: "labour v2026-06-02.v1 added 3 object types",
		time: "3h ago",
		kind: "Products",
	},
];

const SEED_CHANGES: ChangeEntry[] = [
	{
		id: "c1",
		kind: "update-object-type",
		summary: "Renamed “Worker” visibility to Prominent",
		time: "just now",
		undoable: true,
	},
	{id: "c2", kind: "create-link-type", summary: "Created link type “Sites / Project”", time: "2m ago", undoable: true},
	{id: "c3", kind: "add-property", summary: "Added property “contractor” to Worker", time: "6m ago", undoable: false},
	{
		id: "c4",
		kind: "create-object-type",
		summary: "Created object type “Site Inspection”",
		time: "20m ago",
		committed: true,
	},
];

// Projects for the top-bar switcher (sample fixtures). The selection persists across reloads.
const PROJECTS = ["Falcon Heights Medical Tower", "Uptown Tower", "Marina Heights", "NEOM Site 4"];

// The same switcher, one rung up: which company you are working inside rather than which of its
// sites. Defined beside the file system it roots (wc3-fs-data.ts), because picking an org in the bar
// picks the tree under it — two separate lists would mean a selectable org with no files.
const ORGANIZATIONS = WC3_ORGANIZATIONS;

// Files is pinned directly under the nav search, ABOVE Home, with a rule beneath it — the file system
// spans every app in the rail below, so it reads as its own section rather than the first item of the
// app list. That is CoreAppSidebar's `pinnedTop`; a group could not express it, since a group cannot
// sit above Home and cannot draw a rule under itself while V3 has group dividers switched off.
const FILES_ITEM_ID = "files";

// ─── Settings sub-surface ────────────────────────────────────────────────────

const SETTINGS_GROUPS: SideMenuGroup[] = [
	{
		label: "System",
		items: [
			{id: "general", label: "General", icon: SlidersHorizontal},
			{id: "permissions", label: "Permissions & lens", icon: ShieldCheck},
			{id: "telemetry", label: "Telemetry", icon: Radio},
			{id: "datasources", label: "Datasources", icon: Database},
		],
	},
	{
		label: "Ontology",
		items: [
			{id: "object-types", label: "Object types", icon: Box},
			{id: "link-types", label: "Link types", icon: Link2},
			{id: "action-types", label: "Action types", icon: Zap},
			{id: "interfaces", label: "Interfaces", icon: Dna},
			{id: "shared-properties", label: "Shared properties", icon: Puzzle},
			{id: "type-groups", label: "Type groups", icon: Folder},
		],
	},
];

const SETTINGS_ITEMS = SETTINGS_GROUPS.flatMap((group) => group.items);

const SETTING_PLACEHOLDER: Record<string, string> = {
	general: "General settings for this perspective — what it shows and how it derives from the store.",
	permissions: "Which groups see this perspective, and which actions each persona lens may run.",
	telemetry: "Configure the live telemetry feed and how often derived counts refresh.",
	datasources: "The datasources feeding the object types this perspective reads.",
	"object-types": "Define the object types in the shared ontology.",
	"link-types": "Define how object types relate to one another.",
	"action-types": "Configure the actions that can be run against objects.",
	interfaces: "Manage shared interfaces object types can implement.",
	"shared-properties": "Manage properties reused across object types.",
	"type-groups": "Group related types for navigation and permissions.",
};

const settingLabel = (id: string) => SETTINGS_ITEMS.find((item) => item.id === id)?.label ?? "Settings";

// ─── Merged (marketplace) nav ────────────────────────────────────────────────

// In merged mode CoreAppSidebar pins its own Home above every group, so the workspace's own "home"
// perspective would put a second "Home" in the same rail. Drop it there and keep the rest in order.
//
// The remaining perspectives ARE the Studio section of Connect — Analysis, Processes, Pipelines,
// Products, Lineage, Ontology are what an admin builds and configures — so the group carries the
// "Studio" label rather than a second, separate settings list sitting beside them.
// The Marketplace as a Studio item rather than CoreAppSidebar's pinned entry (V3). Its own id so the
// rail can highlight it, and so it cannot be mistaken for a perspective or an installed app.
const MARKETPLACE_ITEM_ID = "studio-marketplace";

// Studio is a group on exactly the same footing as the lifecycle stages: an icon that stands for the
// whole section in the collapsed rail (its perspectives moving into the flyout behind it), a name that
// opens its own page, and a chevron that folds it. `dividerBefore` keeps the break between the app
// stages and Studio in the rail — without it the two runs of icons would read as one list.
const STUDIO_GROUP_ID = "studio";

/**
 * Studio's tints come from the shared palette by id, not by position: these perspectives ARE the apps
 * that own the file system's record kinds, so each takes the hue its records already wear. Pipelines
 * is blue because a pipeline file is blue; Processes violet, Ontology emerald, Analysis cyan, Products
 * rose, Lineage teal (it traces datasets, which the file system tints teal). The colour a reader
 * learns in Files therefore means the same thing in the rail.
 *
 * These are far enough apart on the wheel that no two adjacent rows read as the same colour, which is
 * the same guarantee `toneFor` gives positionally — here it falls out of the meanings instead.
 */
const STUDIO_TONES: Record<string, string> = {
	pipelines: TONE_BY_ID.blue.chip,
	processes: TONE_BY_ID.violet.chip,
	ontology: TONE_BY_ID.emerald.chip,
	analysis: TONE_BY_ID.cyan.chip,
	products: TONE_BY_ID.rose.chip,
	lineage: TONE_BY_ID.teal.chip,
};

/** Studio's items. Tinted only in the V3 shape, to match its tinted app stages; V2 stays plain. */
const studioItems = (lifecycle: boolean) =>
	PERSPECTIVES.filter((p) => p.id !== "home").map((p) => ({
		id: p.id,
		label: p.label,
		icon: p.icon,
		...(lifecycle ? {tone: STUDIO_TONES[p.id] ?? NEUTRAL_TONE} : {}),
	}));

/**
 * Studio's chrome depends on the release. V2 keeps it a plain heading over a list — the shape that
 * release shipped with. V3 puts it on the same footing as its lifecycle stages: an icon, a clickable
 * name, and a chevron. Gated rather than shared, so refining V3 cannot quietly restyle V2.
 */
const mergedWorkspaceGroups = (lifecycle: boolean): SidebarNavGroup[] => [
	{
		label: "Studio",
		items: studioItems(lifecycle),
		...(lifecycle ? {id: STUDIO_GROUP_ID, icon: Blocks, collapsible: true, dividerBefore: true} : {}),
	},
];

// ─── Template ────────────────────────────────────────────────────────────────

export interface WC3WorkspaceProps {
	/**
	 * Merge the marketplace into this workspace — the Core Connect V2 shape. The sidebar becomes one
	 * rail for the whole product: installed apps on top, a divider, the admin perspectives, a divider,
	 * then Marketplace pinned at the bottom. Installing an app from the store adds it straight to the top
	 * section, so there is no second portal to switch to. Defaults to `false`, which is the V1 shape:
	 * perspectives only, no apps and no store (AppInstaller is the separate end-user portal).
	 */
	withMarketplace?: boolean;
	/** Greeting shown on the merged Home surface. Only read when `withMarketplace` is set. */
	userName?: string;
	/**
	 * How installed apps are grouped in the sidebar. `"flat"` (default) puts them all under one
	 * "Your apps" heading — the V2 shape. `"lifecycle"` drops that heading for one labelled group per
	 * project stage (Design / Plan / Capture / Pay), each appearing only once it has an installed app —
	 * the V3 shape. Only read when `withMarketplace` is set.
	 */
	appGrouping?: "flat" | "lifecycle";
	/**
	 * Where the Marketplace entry sits. `"pinned"` (default) uses CoreAppSidebar's pinned entry below
	 * every group — the V2 shape. `"studio"` makes it the last item of the Studio group instead, so
	 * browsing apps reads as part of the studio rather than a fixture of the shell — the V3 shape.
	 * Only read when `withMarketplace` is set.
	 */
	marketplacePlacement?: "pinned" | "studio";
	/**
	 * App ids already installed when the workspace opens, so it starts as a kitted-out project rather
	 * than an empty shell. They behave like any other installed app — uninstall and reinstall them from
	 * the Marketplace — but carry no green "new" dot, which marks something the user just added. Defaults
	 * to none. Only read when `withMarketplace` is set.
	 */
	preinstalledApps?: readonly string[];
	/**
	 * What the top-bar switcher picks. `"project"` (default) lists the projects a user moves between —
	 * the V1/V2 shape. `"organization"` points the same control at the tenants above them, for a
	 * release where the workspace is scoped by company and projects are chosen further in — the V3
	 * shape. Only the switcher changes: the surfaces below it are identical either way.
	 */
	switcherScope?: "project" | "organization";
	/**
	 * Add the file system: a Files entry at the head of the rail, and a surface that browses every
	 * record in the organization by folder — a pipeline, a process, an object type — and opens each one
	 * in the app that owns it. Off by default; the V3 shape turns it on. The tree is a reference layer
	 * over the records the other perspectives already render, so nothing is duplicated by switching it
	 * on. Only read when `withMarketplace` is set.
	 */
	showFiles?: boolean;
}

/**
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreWC3Workspace template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function WC3Workspace({
	withMarketplace = false,
	userName = "Abdullah",
	appGrouping = "flat",
	marketplacePlacement = "pinned",
	preinstalledApps,
	switcherScope = "project",
	showFiles = false,
}: WC3WorkspaceProps = {}) {
	const [mode, setMode] = useState<"default" | "settings">("default");
	// Merged mode only. "workspace" is the admin surface this template has always rendered; the rest are
	// the marketplace halves folded in beside it. In V1 mode `surface` never leaves "workspace".
	// Merged mode lands on Home, the way the standalone installer does.
	const [surface, setSurface] = useState<
		"workspace" | "home" | "marketplace" | "app" | "stage" | "studio" | "files" | "notifications"
	>(withMarketplace ? "home" : "workspace");
	const [activeAppId, setActiveAppId] = useState<string | null>(null);
	// The lifecycle stage whose page is open, set by clicking a group NAME in the sidebar.
	const [activeStage, setActiveStage] = useState<AppLifecycleStage | null>(null);
	// The Search row opens a palette rather than filtering the nav in place. A SAMPLE: it searches what
	// the prototype already holds — the installed apps and the Studio perspectives — so the gesture and
	// the shape are real while the search itself is built properly in its own task.
	const [searchOpen, setSearchOpen] = useState(false);
	// The Marketplace's own tab, mirrored up so the breadcrumb reaches it like every other surface's.
	const [marketplaceTab, setMarketplaceTab] = useState("App Store");
	// Persisted so a reload keeps the same perspective, tab, and selected project.
	const [perspectiveId, setPerspectiveId] = usePersistentState<string>("wc3.workspace.perspective", PERSPECTIVES[0].id);
	const [tabByPerspective, setTabByPerspective] = usePersistentState<Record<string, string>>("wc3.workspace.tabs", {});
	const [project, setProject] = usePersistentState<string>("wc3.project", PROJECTS[0]);
	const [organization, setOrganization] = usePersistentState<string>("wc3.organization", ORGANIZATIONS[0]);
	const byOrg = switcherScope === "organization";
	// The file system is rooted at the SELECTED organization, so switching org in the top bar swaps the
	// whole tree. An org with no tree simply has no Files entry rather than an empty surface.
	// The LIVE nodes. The widget owns no data, so the store holds them and this subscribes.
	const fsNodes = useWc3FsNodes();
	const fsRoot = wc3FsRootByName(byOrg ? organization : ORGANIZATIONS[0]);
	const filesEnabled = withMarketplace && showFiles && fsRoot !== undefined;
	const [fsFolderId, setFsFolderId] = useState<string | null>(null);
	const [fsProjectId, setFsProjectId] = useState<string | null>(null);
	const selectOrganization = useCallback(
		(next: string) => {
			setOrganization(next);
			// Both point into the previous organization's tree, so neither can survive the switch.
			setFsFolderId(null);
			setFsProjectId(null);
		},
		[setOrganization],
	);
	const fsFilterFolder = fsFolderId ? wc3Fs.node(fsFolderId) : undefined;
	const fsOpenProject = fsProjectId ? wc3Fs.node(fsProjectId) : undefined;
	const [activeSetting, setActiveSetting] = useState<string>("general");
	// A tab that drills into a record reports its title here so the top-bar breadcrumb can show it.
	const [detailLabel, setDetailLabel] = useState<string | null>(null);
	// One panel, two entry points: the bell and the changeset button each open it on their own stream.
	const [centre, setCentre] = useState<"notifications" | "changes" | null>(null);
	const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
	const [changes, setChanges] = useState<ChangeEntry[]>(SEED_CHANGES);
	// The LIVE pipeline array. WC3_PIPELINES seeds it once and is never read again by the Pipelines
	// surfaces. It lives HERE, not inside a view, because the perspective's three tabs are three
	// separate registry components: switching tabs unmounts the one you were on, so a run started on
	// the canvas would never reach the Runs tab and a pipeline created in the list would never reach
	// the Palette's "used in". Same shape as `notifications`/`changes` above — seeded from a module
	// const, mutated in-session, gone on reload.
	const [pipelines, setPipelines] = useState(seedPipelines);
	// The LIVE process array. WC3_PROCESSES seeds it once and is never read again by the Processes
	// surfaces. It lives HERE for the same reason `pipelines` does — and because a process edited on
	// its detail page must survive Back to the list, which is a sibling render of the same view. Same
	// shape as `notifications`/`changes`: seeded from a module const, mutated in-session, gone on reload.
	const [processes, setProcesses] = useState(seedProcesses);
	// The LIVE analysis session: one spec + its result per builder mode, plus the saved analyses and
	// materialisations. It lives HERE for the same reason `pipelines` and `processes` do — the
	// perspective's three tabs are three separate registry components, so a spec built on Object
	// analysis would be destroyed by a trip to Saved analyses, and an analysis saved from the builder
	// would never reach the Saved tab. Every mutation is a pure helper in wc3-analysis-shared.tsx that
	// returns a NEW session. Seeded from a module const, mutated in-session, gone on reload.
	const [analysis, setAnalysis] = useState(seedAnalysisSession);
	// The LIVE ontology arrays. Seeded from the fixtures once; the Ontology tabs read and write these
	// rather than their own copies, so a type created from the file system lands where the app lists it.
	const [objectTypes, setObjectTypes] = useState(() => [...WC3_OBJECT_TYPES]);
	const [actionTypes, setActionTypes] = useState(() => [...WC3_ACTION_TYPES]);
	// Mobile navigation drawer — the top-bar hamburger opens the sidebar as a left sheet.
	const [navOpen, setNavOpen] = useState(false);

	// The marketplace half. The hook is always called (hooks cannot be conditional) but nothing it owns
	// is rendered unless `withMarketplace` is set, so V1 behaviour is untouched.
	const install = useAppInstallation({
		initialInstalled: withMarketplace ? preinstalledApps : undefined,
		// Uninstalling the app you are currently looking at drops you back on Home, the way the standalone
		// installer does — Home is always there to land on.
		onUninstalled: (app) => {
			if (activeAppId !== app.id) return;
			setActiveAppId(null);
			setSurface("home");
		},
	});
	const activeApp = APPS.find((a) => a.id === activeAppId) ?? null;
	const openApp = (app: MarketApp) => {
		install.markOpened(app);
		setActiveAppId(app.id);
		setSurface("app");
	};

	const perspective = PERSPECTIVES.find((p) => p.id === perspectiveId) ?? PERSPECTIVES[0];
	// Resolve the item first and read the id back off it: the selection is persisted in localStorage,
	// so a tab id that no longer exists (Products used to carry six) must fall back to the first tab
	// for the tab BAR too, not just for the body.
	const activeTabItem = perspective.tabs.find((t) => t.id === tabByPerspective[perspective.id]) ?? perspective.tabs[0];
	const activeTab = activeTabItem.id;
	const TabIcon = activeTabItem.icon;
	const activeSettingLabel = settingLabel(activeSetting);
	// Ontology, Lineage, Pipelines, Processes, Products and Analysis each own a registry keyed by tab id. A tab
	// missing from its registry still falls through to the perspective's `placeholders` entry below, so wiring
	// one tab at a time is safe.
	const OntologyView = perspective.id === "ontology" ? ONTOLOGY_VIEWS[activeTabItem.id] : undefined;
	const LineageView = perspective.id === "lineage" ? LINEAGE_VIEWS[activeTabItem.id] : undefined;
	const PipelineView = perspective.id === "pipelines" ? PIPELINE_VIEWS[activeTabItem.id] : undefined;
	const ProcessView = perspective.id === "processes" ? PROCESS_VIEWS[activeTabItem.id] : undefined;
	const ProductView = perspective.id === "products" ? PRODUCT_VIEWS[activeTabItem.id] : undefined;
	const AnalysisView = perspective.id === "analysis" ? ANALYSIS_VIEWS[activeTabItem.id] : undefined;
	const showHome = perspective.id === "home";

	// Every perspective except Home itself, in sidebar order. Derived, so adding a perspective adds
	// its card and removing one removes it — the landing page cannot advertise a dead surface.
	const homeCards: Wc3HomeCard[] = PERSPECTIVES.filter((p) => p.id !== "home").map((p) => ({
		id: p.id,
		label: p.label,
		icon: p.icon,
		tabs: p.tabs.map((t) => ({id: t.id, label: t.label, badge: t.badge})),
	}));

	// A perspective's "open →" affordances jump to the perspective that owns the record — and, when the
	// target names one, to the RECORD. The id is handed to the arriving view as `openRecordId`, which it
	// consumes once and reports back as consumed: left set, it would re-open that record every time the
	// user navigated elsewhere within the same perspective.
	const [openRecordId, setOpenRecordId] = useState<string | null>(null);
	const [openedFromFs, setOpenedFromFs] = useState<FileSystemNode | null>(null);
	const openWorkspaceTarget = useCallback(
		(target: Wc3LineageNavTarget) => {
			const next = PERSPECTIVES.find((p) => p.id === target.perspectiveId);
			if (!next) return;
			setPerspectiveId(next.id);
			if (target.tabId && next.tabs.some((t) => t.id === target.tabId))
				setTabByPerspective({...tabByPerspective, [next.id]: target.tabId});
			setOpenRecordId(target.recordId ?? null);
			// Cleared on every navigation; openFsFile re-sets it immediately after, so only an arrival that
			// really came from the tree carries a file location into the breadcrumb.
			setOpenedFromFs(null);
			// Opening a perspective always lands on the workspace — in merged mode the jump can start from
			// the Studio overview or a stage page, and without this the perspective would change underneath
			// a surface that never gives way to it.
			setSurface("workspace");
			setMode("default");
			setDetailLabel(null);
		},
		[tabByPerspective, setPerspectiveId, setTabByPerspective],
	);
	const consumeOpenRecord = useCallback(() => setOpenRecordId(null), []);

	/**
	 * Opening a file from the tree. A file with no `ref` — a spreadsheet, a write-up — has no app behind
	 * it and stays put rather than navigating somewhere arbitrary.
	 */
	const openFsFile = useCallback(
		(node: FileSystemNode) => {
			if (!isWc3Ref(node.ref)) return;
			openWorkspaceTarget(node.ref);
			setOpenedFromFs(node);
		},
		[openWorkspaceTarget],
	);

	/**
	 * Create the record a new file names, and return the address to file it at.
	 *
	 * A "Pipeline" in the file system has to be a pipeline in the Pipelines perspective — a file naming
	 * something that does not exist can only apologise when you click it. Types with no app behind them
	 * (a dataset, a document) return nothing, and the file is filed without a ref.
	 */
	const createFsRecord = useCallback((fileType: string, name: string): Wc3FsRef | undefined => {
		switch (fileType) {
			case "pipeline": {
				const created = createPipeline({name, icon: WC3_PIPELINE_ICONS[0] ?? "pipeline", desc: ""});
				setPipelines((prev) => [...prev, created]);
				return fsRefFor(fileType, created.id);
			}
			case "process": {
				const created = createProcess({name, icon: "workflow", objectTypeId: "", statusProp: ""});
				setProcesses((prev) => [...prev, created]);
				return fsRefFor(fileType, created.id);
			}
			case "object-type": {
				const created = createObjectTypeNamed(name);
				setObjectTypes((prev) => [...prev, created]);
				return fsRefFor(fileType, created.id);
			}
			case "action-type": {
				const created = createActionTypeNamed(name);
				setActionTypes((prev) => [created, ...prev]);
				return fsRefFor(fileType, created.id);
			}
			default:
				return undefined;
		}
	}, []);

	// Where the NEXT record created in a Studio app gets filed. The shell holds it because the shell
	// renders the field and does the filing; the perspective in between only gives the control a place
	// to appear and says when something was made.
	const [fsNewLocation, setFsNewLocation] = useState<string | undefined>(undefined);
	const fsNewLocationId = fsNewLocation ?? (fsRoot ? wc3FsDefaultLocation(fsRoot.id) : undefined);

	/**
	 * The "where does this go?" field every Studio create dialog leads with, and the filing that
	 * follows. Without it a record made in an app had no address at all — it appeared in that app's
	 * list and nowhere else, with an empty Location column beside it, which reads as a bug.
	 */
	const fsCreateLocationField =
		filesEnabled && fsRoot && fsNewLocationId ? (
			<Wc3FsLocationField rootId={fsRoot.id} value={fsNewLocationId} onChange={setFsNewLocation} />
		) : undefined;

	const fileNewRecord = useCallback(
		(fileType: string, perspectiveId: string, tabId: string) => (recordId: string, name: string) => {
			if (!fsNewLocationId) return;
			wc3FsCreate({
				name,
				kind: "file",
				parentId: fsNewLocationId,
				fileType,
				ref: {perspectiveId, tabId, recordId},
			});
		},
		[fsNewLocationId],
	);

	/** Show a record's folder in the file system — the return leg of the loop openFsFile starts. */
	const showInFiles = useCallback((folderId: string | null) => {
		setFsFolderId(folderId);
		setFsProjectId(null);
		setSurface("files");
		setMode("default");
	}, []);

	/** "Open in Pipelines" — the perspective a file's ref points at, named for the panel's action. */
	const fsOpenLabel = useCallback((node: FileSystemNode) => {
		if (!isWc3Ref(node.ref)) return undefined;
		const ref = node.ref;
		const perspective = PERSPECTIVES.find((p) => p.id === ref.perspectiveId);
		return perspective ? `Open in ${perspective.label}` : undefined;
	}, []);

	const workspaceBreadcrumb =
		mode === "settings"
			? `${perspective.label} / Settings / ${activeSettingLabel}`
			: `${perspective.label} / ${activeTabItem.label}${detailLabel ? ` / ${detailLabel}` : ""}`;
	const breadcrumb = !withMarketplace
		? workspaceBreadcrumb
		: surface === "files"
			? [
					"Connect",
					"Files",
					...(fsOpenProject ? [fsOpenProject.name] : fsFilterFolder ? [fsFilterFolder.name] : []),
				].join(" / ")
			: surface === "notifications"
				? "Connect / Notifications"
				: surface === "studio"
					? "Connect / Studio"
					: surface === "stage" && activeStage
						? `Connect / ${activeStage}`
						: surface === "home"
							? "Connect / Home"
							: surface === "marketplace"
								? `Connect / Marketplace / ${marketplaceTab}`
								: surface === "app" && activeApp
									? `Connect / ${activeApp.name}`
									: `Connect / ${workspaceBreadcrumb}`;

	// The merged rail, top to bottom: Home (pinned by CoreAppSidebar, no divider under it), the installed
	// apps, a divider, then Studio. CoreAppSidebar draws the separator between consecutive groups and
	// above the pinned marketplace entry, so every divider falls out of the group structure rather than
	// being placed by hand — expanded AND collapsed. Any group with nothing in it is dropped rather than
	// left as a divider with nothing under it, so the apps sections appear as they are installed into.
	//
	// V2 lists installed apps under one "Your apps" heading and pins Marketplace below every group.
	// V3 drops that heading for one group per lifecycle stage, and moves Marketplace into Studio.
	const appGroups =
		appGrouping === "lifecycle"
			? lifecycleAppGroups(install.installedApps, install.newIds)
			: installedAppsGroup(install.installedApps, install.newIds);

	// The V3 cut of the merged shell: lifecycle app groups, Studio as a peer group with its own icon,
	// Home divided from the groups below it, and the nav search restored. Named once so every piece of
	// V3-only chrome reads as one decision rather than a scatter of `appGrouping === …` checks — and so
	// refining V3 cannot quietly restyle V2, which shares this component.
	const lifecycleShape = withMarketplace && appGrouping === "lifecycle";
	// V3's breadcrumb: the GROUP the surface belongs to, then the surface, then its tab. The group is a
	// link to its own page. No product name in front — "Connect" named the app you are already
	// inside, so it carried nothing.
	const openStudio = () => setSurface("studio");
	const openStage = (stage: AppLifecycleStage) => {
		setActiveStage(stage);
		setSurface("stage");
	};
	// A record opened FROM the tree carries its file location in the top bar, not the perspective that
	// happens to render it — "Files ▸ Data pipelines ▸ BIM intake", the way an open file names its
	// folder in the reference. It holds only while the shell's drill-in segment is still that file:
	// back out of the detail page and the crumb reverts to the perspective's own trail.
	const fsRecordCrumb: {label: string; onSelect?: () => void}[] | undefined =
		filesEnabled && surface === "workspace" && openedFromFs && detailLabel === openedFromFs.name
			? [
					{label: "Files", onSelect: () => showInFiles(null)},
					...wc3Fs
						.ancestors(openedFromFs.id)
						.filter((n) => n.kind !== "root")
						.map((n) => ({label: n.name, onSelect: () => showInFiles(n.id)})),
					{label: openedFromFs.name},
				]
			: undefined;

	const lifecycleBreadcrumb: {label: string; onSelect?: () => void}[] | undefined = !lifecycleShape
		? undefined
		: fsRecordCrumb
			? fsRecordCrumb
			: surface === "notifications"
				? [{label: "Notifications"}]
				: surface === "home"
					? [{label: "Home"}]
					: surface === "studio"
						? [{label: "Studio"}]
						: surface === "stage" && activeStage
							? [{label: activeStage}]
							: surface === "files"
								? [
										// A second crumb, when there is one, is the open project or the folder narrowing
										// the list — clicking "Files" returns to the organization's whole listing.
										{
											label: "Files",
											onSelect:
												fsProjectId || fsFolderId
													? () => {
															setFsProjectId(null);
															setFsFolderId(null);
														}
													: undefined,
										},
										...(fsOpenProject
											? [{label: fsOpenProject.name}]
											: fsFilterFolder
												? [{label: fsFilterFolder.name}]
												: []),
									]
								: surface === "marketplace"
									? [{label: "Studio", onSelect: openStudio}, {label: "Marketplace"}, {label: marketplaceTab}]
									: surface === "app" && activeApp
										? [
												...(APP_LIFECYCLE[activeApp.id]
													? [
															{
																label: APP_LIFECYCLE[activeApp.id],
																onSelect: () => openStage(APP_LIFECYCLE[activeApp.id]),
															},
														]
													: []),
												{label: activeApp.name},
											]
										: mode === "settings"
											? [
													{label: "Studio", onSelect: openStudio},
													{label: perspective.label},
													{label: "Settings"},
													{label: activeSettingLabel},
												]
											: [
													{label: "Studio", onSelect: openStudio},
													{label: perspective.label},
													{label: activeTabItem.label},
													...(detailLabel ? [{label: detailLabel}] : []),
												];

	const baseStudioGroups = mergedWorkspaceGroups(lifecycleShape);
	const studioGroups: SidebarNavGroup[] =
		marketplacePlacement === "studio"
			? baseStudioGroups.map((g, i) =>
					i === baseStudioGroups.length - 1
						? {
								...g,
								items: [
									...g.items,
									{
										id: MARKETPLACE_ITEM_ID,
										label: "Marketplace",
										icon: Store,
										...(lifecycleShape ? {tone: NEUTRAL_TONE} : {}),
									},
								],
							}
						: g,
				)
			: baseStudioGroups;

	const sidebarGroups = withMarketplace ? [...appGroups, ...studioGroups] : WORKSPACE_GROUPS;

	// In merged mode an installed app, a perspective and (in V3) the Marketplace share one rail, so the
	// highlight follows whichever the user is actually on.
	const activeItemId = !withMarketplace
		? perspective.id
		: surface === "files"
			? // Files is the pinned entry, which carries its own mark and suppresses every nav-row
				// highlight; falling through to the perspective id would ALSO light a Studio row.
				undefined
			: surface === "app" && activeAppId
				? `app-${activeAppId}`
				: surface === "marketplace" && marketplacePlacement === "studio"
					? MARKETPLACE_ITEM_ID
					: perspective.id;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={sidebarGroups}
				activeItemId={activeItemId}
				// V3's pinned block is Search / Files / Home / Notifications — four peer rows above the rule.
				// Search is a row that hands off to a search surface, not an inline filter. V2 keeps neither.
				showSearch={lifecycleShape}
				onSearch={() => setSearchOpen(true)}
				// One prop binds ⌘J / Ctrl+J and puts the hint on the row, so the shortcut is discoverable
				// instead of folklore.
				searchShortcut={lifecycleShape ? "j" : undefined}
				showNotifications={lifecycleShape}
				// The workspace's own notification state drives the panel — no widget-side fixture involved.
				// The count is the real unread tally, choosing one opens the full ActivitySheet, and
				// "View all" opens the same sheet the top bar's bell used to, so removing that bell cost
				// no surface.
				notificationsActive={lifecycleShape && surface === "notifications"}
				notifications={lifecycleShape ? notifications : undefined}
				unreadNotifications={lifecycleShape ? notifications.filter((n) => n.unread).length : 0}
				onNotificationSelect={lifecycleShape ? () => setCentre("notifications") : undefined}
				// "View all" is a destination, not another overlay: it opens the Notifications PAGE. The
				// panel already showed the recent few, so sending the reader to a second transient surface
				// would leave them nowhere they could stay, link to or come back to.
				onViewAllNotifications={lifecycleShape ? () => setSurface("notifications") : undefined}
				// V1: the prototype's rail is the perspectives alone — no Home entry, no Marketplace action.
				// V2: the same rail gains a pinned Home above it, an apps section, a Settings group, and the
				// Marketplace entry below it.
				brandName={withMarketplace ? "Connect" : undefined}
				activeGroupId={
					surface === "stage" && activeStage
						? `stage-${activeStage}`
						: surface === "studio"
							? STUDIO_GROUP_ID
							: undefined
				}
				onGroupSelect={(groupId) => {
					if (groupId === STUDIO_GROUP_ID) {
						setSurface("studio");
						return;
					}
					const stage = stageFromGroupId(groupId);
					if (!stage) return;
					setActiveStage(stage);
					setSurface("stage");
				}}
				pinnedTop={
					filesEnabled
						? {
								id: FILES_ITEM_ID,
								label: "Files",
								icon: FolderTree,
								active: surface === "files",
								onSelect: () => {
									setSurface("files");
									setMode("default");
								},
							}
						: undefined
				}
				showHome={withMarketplace}
				homeActive={withMarketplace && surface === "home"}
				onHome={() => setSurface("home")}
				// V3's nav is the widget's tree shape: groups are labelled headers over a spine, so the rules
				// between them drop away, and the rail opens as a short list of section headers that the
				// toggle beside the find bar expands. V2 keeps the flat, ruled, all-open list. Both come
				// from CoreAppSidebar's `variant` rather than being re-derived here.
				variant={lifecycleShape ? "tree" : "list"}
				// V2 (no Files): Home stands alone over the app groups and takes no rule — the group headers
				// already mark every boundary. V3 ignores this: Home joins Files in the pinned block, and
				// that block keeps its own rule beneath the pair. Not part of the variant either way.
				showHomeDivider={false}
				// V3 carries Marketplace inside Studio instead, so the pinned entry is switched off there.
				showMarketplace={withMarketplace && marketplacePlacement === "pinned"}
				marketplaceLabel="Marketplace"
				// Only claim this for the PINNED entry: it also suppresses every nav-row highlight, which
				// would leave V3's Marketplace item unmarked while standing on its own surface.
				marketplaceActive={surface === "marketplace" && marketplacePlacement === "pinned"}
				onMarketplace={() => setSurface("marketplace")}
				mobileOpen={navOpen}
				onMobileOpenChange={setNavOpen}
				onNavigate={(label) => {
					// One rail, up to three kinds of destination: an installed app, the Studio Marketplace item
					// (V3 only), or a perspective. Files is pinned above them all and carries its own handler.
					if (withMarketplace) {
						const app = install.installedApps.find((a) => a.name === label);
						if (app) {
							openApp(app);
							return;
						}
						if (marketplacePlacement === "studio" && label === "Marketplace") {
							setMarketplaceTab("App Store");
							setSurface("marketplace");
							return;
						}
					}
					const next = PERSPECTIVES.find((p) => p.label === label);
					if (!next) return;
					setPerspectiveId(next.id);
					setSurface("workspace");
					// Switching perspectives leaves the settings sub-surface.
					setMode("default");
				}}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar
					activeLabel={breadcrumb}
					breadcrumb={lifecycleBreadcrumb}
					showProjectSwitcher
					projects={byOrg ? ORGANIZATIONS : PROJECTS}
					selectedProject={byOrg ? organization : project}
					onSelectProject={byOrg ? selectOrganization : setProject}
					labels={byOrg ? {findProject: "Find organization...", noProjectsFound: "No organizations found"} : undefined}
					// V3's top bar carries neither the notifications bell nor the changeset button: the
					// sidebar's own Notifications entry is the one way in, and a second bell on the same
					// screen would leave the reader choosing between two doors to one room. V1 and V2 keep
					// both — their sidebars have no notifications entry to replace them.
					actions={
						lifecycleShape ? undefined : (
							<Button
								variant="ghost"
								icon
								aria-label="Changeset"
								className="wwc:relative wwc:h-8 wwc:w-8 wwc:text-muted-foreground"
								onClick={() => setCentre((c) => (c === "changes" ? null : "changes"))}
							>
								<ClipboardList className="wwc:h-4 wwc:w-4" />
								{changes.filter((c) => !c.committed).length > 0 && (
									<span className="wwc:absolute wwc:-right-0.5 wwc:-top-0.5 wwc:flex wwc:h-4 wwc:min-w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-primary wwc:px-1 wwc:text-[9px] wwc:font-semibold wwc:text-primary-foreground wwc:tabular-nums">
										{changes.filter((c) => !c.committed).length}
									</span>
								)}
							</Button>
						)
					}
					showNotifications={!lifecycleShape}
					notificationCount={notifications.filter((n) => n.unread).length}
					onNotificationsClick={() => setCentre((c) => (c === "notifications" ? null : "notifications"))}
					onMenuClick={() => setNavOpen(true)}
				/>

				{/* The Search row's surface: the library's own command palette rather than a bespoke modal,
				    so the search field, the keyboard handling and the empty state are the ones every other
				    palette in the product uses. A SAMPLE — it searches what the prototype already holds, the
				    installed apps and the Studio perspectives, and opening a result lands on it exactly as
				    the rail would. The real search gets built in its own task. */}
				{lifecycleShape && (
					<CommandDialog
						open={searchOpen}
						onOpenChange={setSearchOpen}
						// Wider than the dialog default: the rows carry an app or perspective name with room
						// for a path beside it once real search lands, and a 512px palette would make those
						// truncate on arrival.
						contentClassName="wwc:max-w-2xl"
					>
						<CommandInput placeholder="Search apps and perspectives…" />
						{/* Says what it is, in the surface itself. A placeholder that looks finished is worse
						    than one that admits it: anyone opening this should know the real search is still
						    to come rather than reporting its gaps as bugs. */}
						<div className="wwc:border-b wwc:border-border wwc:bg-muted/40 wwc:px-3 wwc:py-2 wwc:text-[11px] wwc:text-muted-foreground">
							Placeholder — search is not built yet. This lists the installed apps and Studio perspectives so the
							gesture and the shape are real.
						</div>
						{/* Fixed height so the dialog does not resize as results are filtered — the list
						    scrolls inside it instead. */}
						<CommandList className="wwc:h-[320px] wwc:max-h-none">
							<CommandEmpty>No matches.</CommandEmpty>
							<CommandGroup heading="Apps">
								{install.installedApps.map((app) => (
									<CommandItem
										key={app.id}
										value={app.name}
										onSelect={() => {
											setSearchOpen(false);
											openApp(app);
										}}
									>
										<app.icon className="wwc:mr-2 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
										{app.name}
									</CommandItem>
								))}
							</CommandGroup>
							<CommandGroup heading="Studio">
								{PERSPECTIVES.filter((p) => p.id !== "home").map((p) => (
									<CommandItem
										key={p.id}
										value={p.label}
										onSelect={() => {
											setSearchOpen(false);
											setPerspectiveId(p.id);
											setSurface("workspace");
											setMode("default");
										}}
									>
										<p.icon className="wwc:mr-2 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
										{p.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</CommandDialog>
				)}

				{/* V3 opens notifications and the changeset as an ordinary right-hand Sheet — standard
				    overlay, standard cards, standard buttons. The earlier translucent NotificationCenter
				    never sat right against the rest of the shell; V1 and V2 keep it for now. */}
				{lifecycleShape ? (
					<ActivitySheet
						open={centre !== null}
						view={centre ?? "notifications"}
						onOpenChange={(o) => !o && setCentre(null)}
						onViewChange={setCentre}
						notifications={notifications}
						changes={changes}
						onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
						onClearAll={() => setNotifications([])}
						onUndo={(id) => setChanges((prev) => prev.filter((c) => c.id !== id))}
						onApplyAll={() => setChanges((prev) => prev.map((c) => ({...c, committed: true})))}
						onDiscardAll={() => setChanges((prev) => prev.filter((c) => c.committed))}
					/>
				) : (
					<NotificationCenter
						open={centre !== null}
						view={centre ?? "notifications"}
						onOpenChange={(o) => !o && setCentre(null)}
						notifications={notifications}
						changes={changes}
						onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
						onClearAll={() => setNotifications([])}
						onUndo={(id) => setChanges((prev) => prev.filter((c) => c.id !== id))}
						onApplyAll={() => setChanges((prev) => prev.map((c) => ({...c, committed: true})))}
						onDiscardAll={() => setChanges((prev) => prev.filter((c) => c.committed))}
					/>
				)}

				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
					{/* Merged mode folds two more surfaces in beside the admin workspace. Neither can be
					    reached in V1 mode, where `surface` is pinned to "workspace". */}
					{withMarketplace && surface === "studio" ? (
						// The Studio overview IS the perspective-card page — the same HomeView the standalone
						// workspace lands on, which merged mode otherwise has no use for since its Home is the app
						// launcher. One card per perspective, opening it.
						<HomeView cards={homeCards} onOpen={(id) => openWorkspaceTarget({perspectiveId: id})} />
					) : withMarketplace && surface === "stage" && activeStage ? (
						<StageSurface
							fullWidth={lifecycleShape}
							stage={activeStage}
							installed={install.installedApps}
							newIds={install.newIds}
							onOpenApp={openApp}
							onBrowse={() => setSurface("marketplace")}
						/>
					) : surface === "notifications" ? (
						// Deliberately empty. The surface, its route and its breadcrumb exist so the rest of the
						// shell can be wired and reviewed; what fills it is its own task.
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:p-6 wwc:text-center">
							<Bell className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground/40" />
							<p className="wwc:text-[13px] wwc:font-medium wwc:text-foreground">Notifications</p>
							<p className="wwc:max-w-[420px] wwc:text-[12px] wwc:text-muted-foreground">
								This page is not built yet. The full notifications surface comes in its own task.
							</p>
						</div>
					) : filesEnabled && surface === "files" && fsRoot ? (
						<FileSystem
							key={fsRoot.id}
							nodes={fsNodes}
							rootId={fsRoot.id}
							fileTypes={WC3_ALL_FILE_TYPES}
							projectId={fsProjectId}
							onProjectChange={setFsProjectId}
							folderId={fsFolderId}
							onFolderChange={setFsFolderId}
							openLabel={fsOpenLabel}
							onOpenFile={openFsFile}
							onCreate={(draft) =>
								wc3FsCreate({
									...draft,
									// A file whose type has an app behind it gets a RECORD too, and the address that
									// files the two together. The widget knows nothing of records; the shell owns
									// every array one could land in, so the shell builds it.
									ref: draft.kind === "file" && draft.fileType ? createFsRecord(draft.fileType, draft.name) : undefined,
								})
							}
						/>
					) : withMarketplace && surface === "home" ? (
						// Home is always reachable in merged mode, and behaves the way the standalone installer's
						// does: a welcome hero with a Browse CTA while nothing is installed, an app launcher once
						// apps exist.
						<HomeSurface
							fullWidth={lifecycleShape}
							// A launcher grid has no single primary action — every card is an equal choice — so V3
							// drops the wall of primaries. V2 keeps the shape it shipped with.
							cardActionVariant={lifecycleShape ? "secondary" : "default"}
							userName={userName}
							installed={install.installedApps}
							newIds={install.newIds}
							onBrowse={() => setSurface("marketplace")}
							onOpenApp={openApp}
						/>
					) : withMarketplace && surface === "marketplace" ? (
						<MarketplaceSurface
							fullWidth={lifecycleShape}
							title="Marketplace"
							onTabChange={setMarketplaceTab}
							isInstalled={install.isInstalled}
							installingIds={install.installingIds}
							installedCount={install.installedIds.size}
							onDetails={install.setDetailsApp}
							onToggle={install.toggleInstall}
						/>
					) : withMarketplace && surface === "app" ? (
						<AppWorkspace app={activeApp} />
					) : mode === "default" ? (
						<>
							<PageContentHeader
								variant="navigation"
								title={perspective.label}
								tabs={perspective.tabs}
								activeTab={activeTab}
								onTabChange={(tab) => setTabByPerspective({...tabByPerspective, [perspective.id]: tab})}
							/>

							{/* Ontology, Lineage, Pipelines, Processes, Products and Analysis are the real surfaces — the other four are still skeletons. */}
							{showHome ? (
								<HomeView cards={homeCards} onOpen={(id) => openWorkspaceTarget({perspectiveId: id})} />
							) : OntologyView ? (
								<OntologyView
									onDetailChange={setDetailLabel}
									openRecordId={openRecordId}
									onOpenRecordConsumed={consumeOpenRecord}
									onShowInFiles={filesEnabled ? showInFiles : undefined}
									objectTypes={objectTypes}
									onObjectTypesChange={setObjectTypes}
									actionTypes={actionTypes}
									onActionTypesChange={setActionTypes}
									createLocationField={fsCreateLocationField}
									// One tab is showing, so only its own creation can fire — the tab id decides which.
									onRecordCreated={fileNewRecord(
										activeTab === "action-types" ? "action-type" : "object-type",
										"ontology",
										activeTab,
									)}
								/>
							) : LineageView ? (
								<LineageView
									onDetailChange={setDetailLabel}
									onNavigate={openWorkspaceTarget}
									onOpenChangeset={() => setCentre("changes")}
								/>
							) : PipelineView ? (
								<PipelineView
									pipelines={pipelines}
									onPipelinesChange={setPipelines}
									onDetailChange={setDetailLabel}
									onNavigate={openWorkspaceTarget}
									openRecordId={openRecordId}
									onOpenRecordConsumed={consumeOpenRecord}
									onShowInFiles={filesEnabled ? showInFiles : undefined}
									createLocationField={fsCreateLocationField}
									onRecordCreated={fileNewRecord("pipeline", "pipelines", "pipelines")}
								/>
							) : ProcessView ? (
								<ProcessView
									processes={processes}
									onProcessesChange={setProcesses}
									onDetailChange={setDetailLabel}
									onNavigate={openWorkspaceTarget}
									openRecordId={openRecordId}
									onOpenRecordConsumed={consumeOpenRecord}
									onShowInFiles={filesEnabled ? showInFiles : undefined}
									createLocationField={fsCreateLocationField}
									onRecordCreated={fileNewRecord("process", "processes", "processes")}
								/>
							) : ProductView ? (
								<ProductView
									onDetailChange={setDetailLabel}
									onNavigate={openWorkspaceTarget}
									openRecordId={openRecordId}
									onOpenRecordConsumed={consumeOpenRecord}
								/>
							) : AnalysisView ? (
								<AnalysisView
									session={analysis}
									onSessionChange={setAnalysis}
									onDetailChange={setDetailLabel}
									onNavigate={openWorkspaceTarget}
								/>
							) : (
								<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
									<div className={`wwc:w-full wwc:p-6 ${lifecycleShape ? "" : "wwc:mx-auto wwc:max-w-[1200px]"}`}>
										<div className="wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
											<Empty
												icon={TabIcon ? <TabIcon className="wwc:h-6 wwc:w-6" /> : undefined}
												title={activeTabItem.label}
												description={perspective.placeholders[activeTabItem.id]}
											/>
										</div>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:md:flex-row">
							<SideMenu
								title="Settings"
								onBack={() => setMode("default")}
								backLabel={`Back to ${perspective.label}`}
								showSearch={false}
								groups={SETTINGS_GROUPS}
								activeItemId={activeSetting}
								onItemSelect={setActiveSetting}
							/>

							<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
								<div className={`wwc:w-full wwc:p-6 ${lifecycleShape ? "" : "wwc:mx-auto wwc:max-w-[1000px]"}`}>
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

			{withMarketplace && (
				<>
					<AppDetailsDialog
						app={install.detailsApp}
						installed={install.detailsApp ? install.isInstalled(install.detailsApp.id) : false}
						installing={install.detailsApp ? install.installingIds.has(install.detailsApp.id) : false}
						onOpenChange={(open) => !open && install.setDetailsApp(null)}
						onToggle={() => install.detailsApp && install.toggleInstall(install.detailsApp)}
					/>
					<Toaster position="top-right" />
				</>
			)}
		</div>
	);
}

export {PERSPECTIVES as WC3_WORKSPACE_PERSPECTIVES};
export type {Perspective as WC3WorkspacePerspective};
