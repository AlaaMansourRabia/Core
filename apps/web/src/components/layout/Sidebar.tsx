import {ChevronDown, ChevronUp, Search, X} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";
import {NavLink, useLocation} from "react-router-dom";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {TEMPLATES} from "@/lib/templates";
import {cn} from "@/lib/utils";

const topItems = [{name: "Overview", path: "/overview"}];

export const themeItems = [
	{name: "Colors", path: "/theme/colors"},
	{name: "Font Family", path: "/theme/font-family"},
	{name: "Spacing", path: "/theme/spacing"},
	{name: "Radius", path: "/theme/radius"},
];

export interface NavItem {
	name: string;
	path: string;
	/** Optional visual nesting for Storybook titles such as Layout/Card/App Card. */
	depth?: number;
	/** Non-navigable group label (for example a product release grouping several templates). */
	heading?: boolean;
}

export interface ComponentCategory {
	name: string;
	label: string;
	items: NavItem[];
}

// Nav grouped by WakeCore TIER (Components / Widgets / Templates) to mirror Storybook + the manifests,
// with the functional sub-labels kept inside each tier.
export const componentCategories: ComponentCategory[] = [
	{
		name: "primitives",
		label: "Primitives",
		items: [
			{name: "Avatar", path: "/components/avatar"},
			{name: "Badge", path: "/components/badge"},
			{name: "Button", path: "/components/button"},
			{name: "ButtonGroup", path: "/components/button-group"},
			{name: "Checkbox", path: "/components/checkbox"},
			{name: "Chip", path: "/components/chip"},
			{name: "Copy Button", path: "/components/copy-button"},
			{name: "Input", path: "/components/input"},
			{name: "InputGroup", path: "/components/input-group"},
			{name: "Kbd", path: "/components/kbd"},
			{name: "Label", path: "/components/label"},
			{name: "Progress", path: "/components/progress"},
			{name: "Prompt Input", path: "/components/prompt-input"},
			{name: "RadioGroup", path: "/components/radio-group"},
			{name: "Select", path: "/components/select"},
			{name: "Separator", path: "/components/separator"},
			{name: "Skeleton", path: "/components/skeleton"},
			{name: "Slider", path: "/components/slider"},
			{name: "Spinner", path: "/components/spinner"},
			{name: "Switch", path: "/components/switch"},
			{name: "Textarea", path: "/components/textarea"},
			{name: "Toggle", path: "/components/toggle"},
			{name: "ToggleGroup", path: "/components/toggle-group"},
		],
	},
	{
		name: "layout",
		label: "Layout",
		items: [
			{name: "Accordion", path: "/components/accordion"},
			{name: "Area Tree", path: "/components/area-tree"},
			{name: "AspectRatio", path: "/components/aspect-ratio"},
			{name: "BrowserTabs", path: "/components/browser-tabs"},
			{name: "Card", path: "/components/card"},
			{name: "App Card", path: "/components/app-card", depth: 1},
			{name: "Checklist Card", path: "/components/checklist-card"},
			{name: "Collapsible", path: "/components/collapsible"},
			{name: "Property List", path: "/components/property-list"},
			{name: "PushPanel", path: "/components/push-panel"},
			{name: "Resizable", path: "/components/resizable"},
			{name: "ScrollArea", path: "/components/scroll-area"},
			{name: "Sidebar Primitive", path: "/components/sidebar-primitive"},
			{name: "Table", path: "/components/table"},
			{name: "Tabs", path: "/components/tabs"},
			{name: "Tree Row", path: "/components/tree-row"},
		],
	},
	{
		name: "forms",
		label: "Forms",
		items: [
			{name: "Calendar", path: "/components/calendar"},
			{name: "Combobox", path: "/components/combobox"},
			{name: "Date Picker", path: "/components/date-picker"},
			{name: "Field", path: "/components/field"},
			{name: "Form", path: "/components/form"},
			{name: "FormActionBar", path: "/components/form-action-bar"},
			{name: "Input OTP", path: "/components/input-otp"},
			{name: "MultiSelect", path: "/components/multi-select"},
			{name: "Week Selector", path: "/components/week-selector"},
		],
	},
	{
		name: "navigation",
		label: "Navigation",
		items: [
			{name: "Catalogue View Toggle", path: "/components/catalogue-view-toggle"},
			{name: "Breadcrumb", path: "/components/breadcrumb"},
			{name: "Command", path: "/components/command"},
			{name: "Navigation Menu", path: "/components/navigation-menu"},
			{name: "Pagination", path: "/components/pagination"},
			{name: "Stepper", path: "/components/stepper"},
			{name: "Toolbar", path: "/components/toolbar"},
			{name: "Toolbar Color Picker", path: "/components/toolbar-color-picker"},
			{name: "Toolbar Menu Button", path: "/components/toolbar-menu-button"},
			{name: "Toolbar Pager", path: "/components/toolbar-pager"},
			{name: "View Tab Bar", path: "/components/view-tab-bar"},
		],
	},
	{
		name: "overlay",
		label: "Overlay",
		items: [
			{name: "Add Observation Dialog", path: "/components/add-observation-dialog"},
			{name: "Dialog", path: "/components/dialog"},
			{name: "Alert Dialog", path: "/components/alert-dialog"},
			{name: "Sheet", path: "/components/sheet"},
			{name: "Drawer", path: "/components/drawer"},
			{name: "Popover", path: "/components/popover"},
			{name: "Tooltip", path: "/components/tooltip"},
			{name: "Hover Card", path: "/components/hover-card"},
			{name: "Dropdown Menu", path: "/components/dropdown-menu"},
			{name: "Context Menu", path: "/components/context-menu"},
			{name: "Menubar", path: "/components/menubar"},
			{name: "Export Dialog", path: "/components/export-dialog"},
		],
	},
	{
		name: "feedback",
		label: "Feedback",
		items: [
			{name: "Alert", path: "/components/alert"},
			{name: "Banner", path: "/components/banner"},
			{name: "Empty", path: "/components/empty"},
			{name: "Sonner", path: "/components/sonner"},
			{name: "Thinking Pill", path: "/components/thinking-pill"},
			{name: "Toast", path: "/components/toast"},
			{name: "Tool Call", path: "/components/tool-call"},
			{name: "Turn Progress", path: "/components/turn-progress"},
			{name: "Turn Timer", path: "/components/turn-timer"},
		],
	},
	{
		name: "data-display",
		label: "Data Display",
		items: [
			{name: "Asset List Item", path: "/components/asset-list-item"},
			{name: "Building Progress", path: "/components/building-progress"},
			{name: "Carousel", path: "/components/carousel"},
			{name: "Compare Bars", path: "/components/compare-bars"},
			{name: "Compare View", path: "/components/compare-view"},
			{name: "Image Zoom", path: "/components/image-zoom"},
			{name: "Item", path: "/components/item"},
			{name: "Legend", path: "/components/legend"},
			{name: "Milestone Table", path: "/components/milestone-table"},
			{name: "Progress Comparison", path: "/components/progress-comparison"},
			{name: "TimeScrubber", path: "/components/time-scrubber"},
			{name: "Timeline Range Selector", path: "/components/timeline-range-selector"},
			{name: "Typography", path: "/components/typography"},
		],
	},
	{
		name: "drawing-canvas",
		label: "Drawing Canvas",
		items: [
			{name: "Vertical Zoom Tools", path: "/components/vertical-zoom-tools"},
			{name: "Zoom Tools", path: "/components/zoom-tools"},
		],
	},
];

export const widgetCategories: ComponentCategory[] = [
	{
		name: "activity",
		label: "Activity",
		items: [
			{name: "Activity Log", path: "/components/activity-log"},
			{name: "Activity Sheet", path: "/components/activity-sheet"},
			{name: "Work Item Card", path: "/components/work-item-card"},
		],
	},
	{
		name: "admin",
		label: "Admin",
		items: [{name: "Permission Matrix", path: "/components/permission-matrix"}],
	},
	{
		name: "analytics",
		label: "Analytics",
		items: [
			{name: "KPIBar", path: "/components/kpi-bar"},
			{name: "KPISummary", path: "/components/kpi-summary"},
			{name: "MetricCard", path: "/components/metric-card"},
			{name: "Toolbar Stats", path: "/components/toolbar-stats"},
		],
	},
	{
		name: "authoring",
		label: "Authoring",
		items: [
			{name: "Form Dialog", path: "/components/form-dialog"},
			{name: "Wizard Dialog", path: "/components/wizard-dialog"},
		],
	},
	{
		name: "canvas",
		label: "Canvas",
		items: [
			{name: "Graph Canvas", path: "/components/graph-canvas"},
			{name: "Canvas File Picker", path: "/components/canvas-file-picker"},
			{name: "Canvas Navigator", path: "/components/canvas-navigator"},
			{name: "Canvas Toolbar", path: "/components/canvas-toolbar"},
			{name: "Drawing Actions", path: "/components/drawing-actions"},
			{name: "Object Drawing Toolbar", path: "/components/object-drawing-toolbar"},
		],
	},
	{
		name: "charts",
		label: "Charts",
		items: [
			{name: "Area Chart", path: "/charts/area"},
			{name: "Bar Chart", path: "/charts/bar"},
			{name: "Funnel Chart", path: "/charts/funnel"},
			{name: "Gauge Chart", path: "/charts/gauge"},
			{name: "Heatmap Chart", path: "/charts/heatmap"},
			{name: "Line Chart", path: "/charts/line"},
			{name: "Pie Chart", path: "/charts/pie"},
			{name: "Radar Chart", path: "/charts/radar"},
			{name: "Scatter Chart", path: "/charts/scatter"},
			{name: "Treemap Chart", path: "/charts/treemap"},
			{name: "Trend Chart", path: "/components/trend-chart"},
		],
	},
	{
		name: "chat",
		label: "Chat",
		items: [
			{name: "AI Chat", path: "/components/ai-chat"},
			{name: "Chat Widget", path: "/components/chat-widget"},
			{name: "Floating Assistant", path: "/components/floating-assistant"},
		],
	},
	{
		name: "comments",
		label: "Comments",
		items: [
			{name: "Comment Composer", path: "/components/comment-composer"},
			{name: "Comment Thread", path: "/components/comment-thread"},
		],
	},
	{
		name: "connect",
		label: "Connect",
		items: [
			{name: "Create Process Dialog", path: "/components/create-process-dialog"},
			{name: "Install Product Dialog", path: "/components/install-product-dialog"},
			{name: "Run Action Dialog", path: "/components/run-action-dialog"},
			{name: "Analysis Workbench", path: "/components/analysis-workbench"},
			{name: "App Marketplace", path: "/components/app-marketplace"},
			{name: "Lineage Impact View", path: "/components/lineage-impact-view"},
			{name: "Health View", path: "/components/health-view"},
			{name: "State Machine", path: "/components/state-machine"},
		],
	},
	{
		name: "data",
		label: "Data",
		items: [
			{name: "DataTable", path: "/components/data-table"},
			{name: "Filter", path: "/components/filter"},
			{name: "SearchFilterBar", path: "/components/search-filter-bar"},
		],
	},
	{
		name: "map",
		label: "Map",
		items: [
			{name: "3D View", path: "/map/3d-view"},
			{name: "Blueprint Segment", path: "/components/blueprint-segment"},
			{name: "Building Model Placeholder", path: "/components/building-model-placeholder"},
			{name: "Capture Route Minimap", path: "/components/capture-route-minimap"},
			{name: "Default", path: "/map/map"},
			{name: "Directions", path: "/map/directions"},
			{name: "Drawing", path: "/map/drawing"},
			{name: "Heatmap", path: "/map/heatmap"},
			{name: "Map Compass", path: "/components/map-compass"},
			{name: "Map Minimap", path: "/components/map-minimap"},
			{name: "Map Toolbar", path: "/components/map-toolbar"},
		],
	},
	{
		name: "navigation",
		label: "Navigation",
		items: [
			{name: "Record Detail Shell", path: "/components/record-detail-shell"},
			{name: "App Top Bar", path: "/components/app-top-bar"},
			{name: "Canvas Header", path: "/components/canvas-header"},
			{name: "FilterStrip", path: "/components/filter-strip"},
			{name: "Page Content Header", path: "/components/page-content-header"},
			{name: "Side Menu", path: "/components/side-menu"},
			{name: "Sidebar", path: "/components/sidebar"},
		],
	},
	{
		name: "ontology",
		label: "Ontology",
		items: [
			{name: "New Object Type Dialog", path: "/components/new-object-type-dialog"},
			{name: "New Link Type Dialog", path: "/components/new-link-type-dialog"},
			{name: "New Action Type Dialog", path: "/components/new-action-type-dialog"},
			{name: "New Interface Dialog", path: "/components/new-interface-dialog"},
			{name: "New Type Group Dialog", path: "/components/new-type-group-dialog"},
			{name: "New Shared Property Dialog", path: "/components/new-shared-property-dialog"},
		],
	},
	{
		name: "overlay",
		label: "Overlay",
		items: [{name: "Walkthrough Modal", path: "/components/walkthrough-modal"}],
	},
	{
		name: "progress",
		label: "Progress",
		items: [
			{name: "Operations Drawer", path: "/components/operations-drawer"},
			{name: "Progress List Item", path: "/components/progress-list-item"},
		],
	},
	{
		name: "schedule",
		label: "Schedule",
		items: [
			{name: "Calendar View", path: "/components/calendar-view"},
			{name: "Gantt", path: "/components/gantt"},
		],
	},
	{
		name: "setup",
		label: "Setup",
		items: [{name: "SetupStepsChecklist", path: "/components/setup-steps-checklist"}],
	},
	{
		name: "threejs",
		label: "Three.js",
		items: [{name: "Fragment Viewer", path: "/components/fragment-viewer"}],
	},
];

/** Storybook's Widgets/Profile is a direct widget entry, not a subgroup. */
export const widgetItems: NavItem[] = [{name: "Profile", path: "/components/profile"}];

export const templateItems: NavItem[] = TEMPLATES.map((t) => ({name: t.name, path: `/templates/${t.id}`}));

/** The Templates nav, with a heading above each product release (WakeCap Connect / V1, …) and its
 *  members indented under it. `templateItems` stays link-only so counts and the Overview grid are
 *  unaffected. */
export const templateNavItems: NavItem[] = TEMPLATES.flatMap((t, i) => {
	const item: NavItem = {name: t.name, path: `/templates/${t.id}`, depth: t.group ? 1 : undefined};
	const startsGroup = t.group !== undefined && t.group !== TEMPLATES[i - 1]?.group;
	return startsGroup ? [{name: t.group as string, path: `#${t.group}`, heading: true}, item] : [item];
});

export const countItems = (cats: ComponentCategory[]) => cats.reduce((sum, c) => sum + c.items.length, 0);
const linkClass = (isActive: boolean) =>
	cn(
		"wwc:block wwc:rounded-md wwc:px-2 wwc:py-1 wwc:text-[13px] wwc:transition-colors",
		isActive
			? "wwc:bg-sidebar-accent wwc:text-sidebar-accent-foreground wwc:font-medium"
			: "wwc:text-sidebar-foreground wwc:hover:bg-sidebar-accent wwc:hover:text-sidebar-accent-foreground",
	);

function NavItems({items, pathname}: {items: NavItem[]; pathname: string}) {
	return (
		<nav className="wwc:space-y-0.5">
			{items.map((item) =>
				item.heading ? (
					<div
						key={item.path}
						className="wwc:px-2 wwc:pt-2 wwc:pb-0.5 wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground/70"
					>
						{item.name}
					</div>
				) : (
					<NavLink
						key={item.path}
						to={item.path}
						className={({isActive}) => cn(linkClass(isActive), item.depth && "wwc:ml-3")}
						data-active={pathname === item.path}
						data-wakecore-route-link
						data-wakecore-interaction={item.path === "/components/button" ? "open-artifact-preview" : undefined}
					>
						{item.name}
					</NavLink>
				),
			)}
		</nav>
	);
}

function Subgroups({
	categories,
	pathname,
	forceOpen = false,
}: {
	categories: ComponentCategory[];
	pathname: string;
	forceOpen?: boolean;
}) {
	// Expanded groups tracked by name; default (absent) = collapsed.
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	return (
		<div className="wwc:space-y-px">
			{categories.map((cat) => {
				const open = forceOpen || expanded[cat.name];
				return (
					<div key={cat.name}>
						<button
							type="button"
							onClick={() => setExpanded((c) => ({...c, [cat.name]: !c[cat.name]}))}
							aria-expanded={open}
							data-wakecore-interaction={cat.name === "primitives" ? "browse-by-tier" : undefined}
							className="wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-2 wwc:py-1 wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground/70 wwc:hover:text-foreground wwc:transition-colors"
						>
							<span className="wwc:flex wwc:items-center wwc:gap-1.5">
								{cat.label}
								<span className="wwc:font-normal wwc:text-muted-foreground/50">{cat.items.length}</span>
							</span>
							{open ? (
								<ChevronUp className="wwc:h-3.5 wwc:w-3.5 wwc:flex-shrink-0" />
							) : (
								<ChevronDown className="wwc:h-3.5 wwc:w-3.5 wwc:flex-shrink-0" />
							)}
						</button>
						{open && (
							<div className="wwc:mb-1">
								<NavItems items={cat.items} pathname={pathname} />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

function filterCats(cats: ComponentCategory[], q: string) {
	if (!q) return cats;
	return cats
		.map((c) => ({...c, items: c.items.filter((i) => i.name.toLowerCase().includes(q))}))
		.filter((c) => c.items.length > 0);
}
function filterItems(items: NavItem[], q: string) {
	// A search result is a flat list of links — group headings only make sense in the unfiltered nav.
	return q ? items.filter((i) => !i.heading && i.name.toLowerCase().includes(q)) : items;
}

interface SidebarProps {
	collapsed?: boolean;
}

export function CatalogSidebar({collapsed = false}: SidebarProps) {
	const [search, setSearch] = useState("");
	const location = useLocation();
	const pathname = location.pathname;
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Cmd/Ctrl+K focuses the search input from anywhere in the app.
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		const timer = setTimeout(() => {
			const activeLink = container.querySelector('[data-active="true"]');
			if (activeLink) activeLink.scrollIntoView({behavior: "smooth", block: "center"});
		}, 50);
		return () => clearTimeout(timer);
	}, [location.pathname]);

	const q = search.toLowerCase();
	const fTop = useMemo(() => filterItems(topItems, q), [q]);
	const fTheme = useMemo(() => filterItems(themeItems, q), [q]);
	const fComp = useMemo(() => filterCats(componentCategories, q), [q]);
	const fWid = useMemo(() => filterCats(widgetCategories, q), [q]);
	const fWidgetItems = useMemo(() => filterItems(widgetItems, q), [q]);
	const fTpl = useMemo(() => filterItems(templateNavItems, q), [q]);

	const hasResults =
		fTop.length > 0 ||
		fTheme.length > 0 ||
		fComp.length > 0 ||
		fWid.length > 0 ||
		fWidgetItems.length > 0 ||
		fTpl.length > 0;

	const tierHeader = (label: string, count: number) => (
		<h4 className="wwc:px-2 wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
			{label} {!search && `(${count})`}
		</h4>
	);

	return (
		<div
			data-wakecore-sidebar="designers-hub-sidebar"
			data-wakecore-region="catalog-navigation"
			data-wakecore-surface-owner="shell"
			data-wakecore-artifact="designers-hub-sidebar"
			data-wakecore-density="comfortable"
			data-wakecore-navigation-fingerprint="designers-hub-catalog-navigation"
			className={cn(
				"wwc:h-screen wwc:border-r wwc:bg-sidebar wwc:transition-all wwc:duration-300 wwc:ease-in-out wwc:overflow-hidden",
				collapsed ? "wwc:w-0 wwc:border-r-0" : "wwc:w-64",
			)}
		>
			<div className="wwc:flex wwc:h-full wwc:w-64 wwc:min-w-64 wwc:flex-col">
				<div className="wwc:px-3 wwc:py-3 wwc:border-b">
					<div className="wwc:relative" data-wakecore-responsive-group="catalog-search" data-wakecore-responsive-atomic>
						<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						<Input
							ref={searchInputRef}
							placeholder="Search..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="wwc:pl-8 wwc:pr-8 wwc:h-8 wwc:text-sm"
							data-wakecore-interaction="search-artifacts"
							data-wakecore-affordance-purpose="catalog-search"
						/>
						{search ? (
							<Button
								variant="ghost"
								icon
								onClick={() => setSearch("")}
								className="wwc:absolute wwc:right-1 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-6 wwc:w-6"
							>
								<X className="wwc:h-3 wwc:w-3" />
							</Button>
						) : (
							<kbd className="wwc:pointer-events-none wwc:absolute wwc:right-2 wwc:top-1/2 wwc:-translate-y-1/2 wwc:flex wwc:h-5 wwc:select-none wwc:items-center wwc:gap-0.5 wwc:rounded wwc:border wwc:bg-muted wwc:px-1.5 wwc:font-mono wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground">
								⌘K
							</kbd>
						)}
					</div>
				</div>

				<div className="wwc:relative wwc:flex-1 wwc:overflow-hidden">
					<ScrollArea className="wwc:h-full wwc:py-4 wwc:px-3" ref={scrollContainerRef}>
						{!hasResults ? (
							<div className="wwc:text-center wwc:py-8 wwc:text-sm wwc:text-muted-foreground">No results found</div>
						) : (
							<div className="wwc:space-y-3">
								{fTop.length > 0 && <NavItems items={fTop} pathname={pathname} />}

								{fTheme.length > 0 && (
									<div>
										{tierHeader("Getting Started", themeItems.length)}
										<Subgroups
											categories={[{name: "design-tokens", label: "Design Tokens", items: fTheme}]}
											pathname={pathname}
											forceOpen={Boolean(q)}
										/>
									</div>
								)}

								{fComp.length > 0 && (
									<>
										<Separator />
										{tierHeader("Components", countItems(componentCategories))}
										<Subgroups categories={fComp} pathname={pathname} forceOpen={Boolean(q)} />
									</>
								)}

								{(fWid.length > 0 || fWidgetItems.length > 0) && (
									<>
										<Separator />
										{tierHeader("Widgets", countItems(widgetCategories) + widgetItems.length)}
										{fWid.length > 0 && <Subgroups categories={fWid} pathname={pathname} forceOpen={Boolean(q)} />}
										{fWidgetItems.length > 0 && (
											<div className="wwc:mt-1">
												<NavItems items={fWidgetItems} pathname={pathname} />
											</div>
										)}
									</>
								)}

								{fTpl.length > 0 && (
									<>
										<Separator />
										{tierHeader("Templates", templateItems.length)}
										<NavItems items={fTpl} pathname={pathname} />
									</>
								)}

								<div className="wwc:h-8" aria-hidden="true" />
							</div>
						)}
					</ScrollArea>
					<div className="wwc:pointer-events-none wwc:absolute wwc:bottom-0 wwc:left-0 wwc:right-0 wwc:h-12 wwc:bg-gradient-to-t wwc:from-sidebar wwc:to-transparent" />
				</div>
			</div>
		</div>
	);
}
