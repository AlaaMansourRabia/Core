// SitePanel — the left-overlay stack extracted from `CaptureUiEnhanced` (see docs/WIDGET_DECOMPOSITION.md,
// §2B). A CONTROLLED Core widget: it renders the floating rail (search, location stepper, zone
// progress, SPA/Progress distribution, villa list), the `CanvasNavigator`, the full-height search-results
// panel, the rail shrink-ghost, and the villa detail panel (Overview / Floors / Evidence / Activities).
//
// It NEVER owns shared/business state. Every shared value (view/mode/level/currentLocation, selection,
// detailOpen, mapMode, searchOpen, distribution, the derived nouns/labels) arrives as a PROP; every change
// it wants is requested through a SEMANTIC CALLBACK (`onSelectVilla`, `onStepLocation`, `onMapModeChange`,
// `onSearchOpenChange`, …) so the host reducer keeps its guards / jump-toast / transition machine in one
// place. The widget holds ONLY its own local UI state (see below).
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────────
// INTERACTIONS THIS WIDGET OWNS  (control → prop/callback)
// ─────────────────────────────────────────────────────────────────────────────────────────────────────
//  Rail search field (DashboardSearchField):
//    • type / clear (X)                        → local `query` (setQuery); clearing sets query "" ; typing
//                                                 un-collapses the rail (local `railCollapsed`).
//    • Enter                                   → openSearch("level")  → local `searchLevels` + onSearchOpenChange(true)
//    • Escape                                  → closeSearch()        → onSearchOpenChange(false) + reset local
//    • collapse chevron                        → local `railCollapsed` toggle
//    • scope rows ("Search in …" / "all")      → openSearch(scope)    → local `searchLevels` + onSearchOpenChange(true)
//  Location stepper (in the rail — §3 of the design doc, deliberately NOT in the toolbar):
//    • prev / next chevrons                    → onStepLocation(-1|1) ; disabled when `mode === "3d"`
//    • current-location card                   → local `navigatorOpen` = true  (+ optional onOpenNavigator())
//  SPA / Progress distribution tabs            → onMapModeChange(m)
//  "Villas on map" header                      → openLevelList()      → local `query`/`searchLevels` + onSearchOpenChange(true)
//  Villa list row                              → onSelectVilla(id)
//  CanvasNavigator:
//    • leaf / branch select                    → onNavigate(node) + close navigator (local)
//    • collapse (X)                            → local `navigatorOpen` = false
//  Full-height search panel:
//    • input / close X / Escape                → local `query` + onSearchOpenChange(false)
//    • per-level filter chips                  → local `searchLevels` (toggleSearchLevel)
//    • sort menu (Popover)                     → local `searchSort` / `sortMenuOpen`
//  Villa detail panel:
//    • pinned search Enter                     → onCloseDetail() + open full-height search (all levels)
//    • pinned search X / Escape                → onCloseDetail() + local `railGhost` = true (shrink replay)
//    • Overview / Floors / Evidence / Activities tabs → local `detailTab`
//    • Blueprints action                       → onOpenBlueprints(villa) OR local fallback Dialog (`blueprintsOpen`)
//    • 360 Walkthrough / Progress Details      → onOpenWalkthrough / onOpenProgressDetails (no-op if unset)
//    • Evidence sub-tabs                       → local `evidenceTab`
//    • scroll / mouse-enter                    → local overlay-scrollbar ping (`detailScrollbar`)
//  Rail element measurement                    → onPanelResize(el)  (host measures sidebarFull / maxPanelH)
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────────
// ANIMATIONS THIS WIDGET OWNS
// ─────────────────────────────────────────────────────────────────────────────────────────────────────
//  • `chromeFade` (prop, reportsOpen fade)     → opacity/pointer-events on navigator, search, rail, detail.
//  • Rail collapse chevron                     → `wwc:transition-transform` + `wwc:rotate-180` when collapsed.
//  • VillaDetailSearch width morph 320px→full  → `wwc:transition-[width] wwc:duration-300 wwc:ease-out`.
//  • RailSearchShrinkGhost 376→320px           → self-removing after 320ms (`onDone` → clears `railGhost`).
//  • Distribution bars                         → `flexGrow: count` sizing.
//  • Detail overlay scrollbar                  → `wwc:transition-opacity wwc:duration-300`, auto-hide after 1s.
//  • Active list row                           → `wwc:border-primary wwc:bg-primary/5` ring selection.
//  • All hovers                                → `wwc:transition-colors`.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────────
// LOCAL STATE (never leaks): query, searchLevels, searchSort, sortMenuOpen, railCollapsed, navigatorOpen,
// railGhost, detailTab, evidenceTab, detailScrollbar(+timer/ref), blueprintsOpen, plus the helper-local
// state of DashboardSearchField / VillaDetailSearch / RailSearchShrinkGhost.  `query` is shared ONLY across
// this widget's three surfaces (rail ↔ detail ↔ full-height panel); no other widget reads it.
// `searchOpen` is the one lifted value (host drives the BuildingViewer Layers offset from it) — the widget
// requests it via `onSearchOpenChange` and mirrors the `searchOpen` prop in render.

import {cn} from "@core/core-utils";
import {
	ArrowUpDown,
	ArrowUpRight,
	BarChart3,
	Check,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clock,
	Home,
	Layers,
	LayoutGrid,
	Link2,
	Map as MapIcon,
	Rotate3d,
	Ruler,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";
import {
	type ChangeEvent,
	type ComponentType,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "./accordion";
import {Badge} from "./badge";
import {Button} from "./button";
import {CanvasNavigator, type CanvasNavigatorNode} from "./canvas-navigator";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "./dialog";
import {Input} from "./input";
import {Popover, PopoverAnchor, PopoverContent, PopoverTrigger} from "./popover";
import {Separator} from "./separator";
import {styleForVilla, type MapMode, type Villa as SiteVilla} from "./site-image-viewer";
import {ALMANAR_BATCHES, ALMANAR_PHASES, ALMANAR_VILLAS, ALMANAR_ZONES_MARKETING} from "./site-image-viewer-fixtures";
import {MONOCHROME_STYLE} from "./site-image-viewer/milestone-ramp";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./tabs";

/* ------------------------------------------------------------------ *
 * Shared axis types (mirrored from the host page; re-exported here so
 * the widget stands alone until the package root re-exports them).
 * ------------------------------------------------------------------ */
export type ViewId = "villa" | "batch";
export type ViewMode = "plan" | "satellite" | "3d";
export type LevelId = "block" | "batch" | "zone" | "phase";
export type {MapMode, CanvasNavigatorNode};

/**
 * A search FILTER selection. The host owns the active list (applies it to the villa set feeding the map, 3D
 * and list) and renders the chips under the toolbar; SitePanel renders the picker and reports changes.
 */
export type CaptureFilterKind = "batch" | "block" | "milestone" | "variance";
export type CaptureFilter = {kind: CaptureFilterKind; value: string; label: string};
export type CaptureFilterOption = {value: string; label: string};
/** The options offered by the filter menu, grouped by kind (host-derived: batch/block are the current zone's). */
export type CaptureFilterOptions = {
	batches: CaptureFilterOption[];
	blocks: CaptureFilterOption[];
	milestones: CaptureFilterOption[];
	variances: CaptureFilterOption[];
};

/** The left-rail row shape (NOT the SiteImageViewer footprint) — id + display fields + approved/planned %. */
export type SitePanelVilla = {
	id: string;
	name: string;
	meta: string;
	approved: number;
	planned: number;
};

/** One distribution bucket (host memo, bucketed by `mapMode`). */
export type SitePanelDistributionBucket = {
	id: string;
	label: string;
	/** Progress/variance range for the label, e.g. "35–50%" — shown under the label in the distribution. */
	range?: ReactNode;
	color: string;
	count: number;
};

/** Payload for the detail-rail action seams — structurally identical to the host's `CaptureDetailVilla`. */
export type CaptureDetailVilla = {
	id: number | string;
	lbsItemId: number | null;
	name: string;
	plotNumber: string;
};

/* ------------------------------------------------------------------ *
 * Fixture-backed search corpus (the full-height panel is fixture-backed;
 * the host hides it via `hideSearch`). Same mapping the page uses.
 * ------------------------------------------------------------------ */
const VILLA_TYPE_LABELS: Record<string, string> = {
	TH: "Townhouse",
	DT: "Detached",
	VL: "Villa",
	VD: "Villa Duplex",
	DP: "Duplex",
};
function villaTypeLabel(name: string) {
	const code = name.match(/[A-Z]{2}/)?.[0];
	return (code && VILLA_TYPE_LABELS[code]) || "Unit";
}
function villaRows(villas: SiteVilla[]): SitePanelVilla[] {
	return villas.map((v) => ({
		id: String(v.id),
		name: v.name,
		meta: `${villaTypeLabel(v.name)} · Plot ${v.plotNumber}`,
		approved: Math.round(v.approvedProgressPercent ?? 0),
		planned: Math.round(v.plannedProgressPercent ?? 0),
	}));
}
function toRows(polys: SiteVilla[]): SitePanelVilla[] {
	return polys.map((b) => ({
		id: String(b.linkedLbsItemId ?? b.id),
		name: b.name,
		meta: b.plotNumber ? `${b.plotNumber} units` : "",
		approved: Math.round(b.approvedProgressPercent ?? 0),
		planned: Math.round(b.plannedProgressPercent ?? 0),
	}));
}

type LevelKind = "villa" | "batch" | "zone" | "phase";
const SEARCH_LEVELS: {kind: LevelKind; label: string; singular: string; icon: typeof Home; rows: SitePanelVilla[]}[] = [
	{kind: "villa", label: "Villas", singular: "Villa", icon: Home, rows: villaRows(ALMANAR_VILLAS)},
	{kind: "batch", label: "Batches", singular: "Batch", icon: LayoutGrid, rows: toRows(ALMANAR_BATCHES)},
	{kind: "zone", label: "Zones", singular: "Zone", icon: MapIcon, rows: toRows(ALMANAR_ZONES_MARKETING)},
	{kind: "phase", label: "Phases", singular: "Phase", icon: Layers, rows: toRows(ALMANAR_PHASES)},
];

type SearchSort = "relevance" | "alpha-asc" | "alpha-desc" | "progress-asc" | "progress-desc";
const SEARCH_SORTS: {id: SearchSort; label: string}[] = [
	{id: "relevance", label: "Relevance"},
	{id: "alpha-asc", label: "Alphabetical (A–Z)"},
	{id: "alpha-desc", label: "Alphabetical (Z–A)"},
	{id: "progress-asc", label: "Progress (low → high)"},
	{id: "progress-desc", label: "Progress (high → low)"},
];

/** A villa's swatch colour for the current mode — the same resolver the map polygons + legend use. */
function villaColor(v: {approved: number; planned: number}, mode: MapMode) {
	return styleForVilla(
		{linkedLbsItemId: 1, approvedProgressPercent: v.approved, plannedProgressPercent: v.planned},
		mode,
	).fill;
}

/* ------------------------------------------------------------------ *
 * Detail-panel fixtures (mock, self-contained).
 * ------------------------------------------------------------------ */
type MilestoneStatus = "late" | "early" | "on-time";
type MilestoneRow = {
	id: string;
	label: string;
	actual: string;
	planned: string;
	status: MilestoneStatus;
	dotClass: string;
};
const MILESTONES: MilestoneRow[] = [
	{id: "m35", label: "M35", actual: "Jun-26", planned: "Jan-26", status: "late", dotClass: "wwc:bg-sky-900"},
	{id: "m50", label: "M50", actual: "Jun-26", planned: "May-26", status: "late", dotClass: "wwc:bg-sky-700"},
	{id: "m65", label: "M65", actual: "Nov-26", planned: "Nov-26", status: "on-time", dotClass: "wwc:bg-blue-500"},
	{id: "m80", label: "M80", actual: "Mar-27", planned: "Apr-27", status: "early", dotClass: "wwc:bg-cyan-400"},
	{id: "m95", label: "M95", actual: "Jun-27", planned: "Jul-27", status: "early", dotClass: "wwc:bg-green-300"},
	{id: "m100", label: "M100", actual: "Aug-27", planned: "Aug-27", status: "on-time", dotClass: "wwc:bg-amber-400"},
];

type FloorStatus = "ahead" | "on-track" | "behind";
const FLOORS: {code: string; value: number; status: FloorStatus}[] = [
	{code: "RF", value: 76, status: "ahead"},
	{code: "UF", value: 22, status: "behind"},
	{code: "FF", value: 54, status: "on-track"},
	{code: "GF", value: 39, status: "behind"},
	{code: "SS", value: 94, status: "ahead"},
];

const EVIDENCE_TABS = [
	{value: "360", label: "360°"},
	{value: "drone", label: "Drone"},
	{value: "wir", label: "WIR"},
];

function floorBarClass(status: FloorStatus) {
	if (status === "ahead") return "wwc:bg-success";
	if (status === "behind") return "wwc:bg-destructive";
	return "wwc:bg-info";
}
function milestoneToneClass(status: MilestoneStatus) {
	if (status === "late") return "wwc:text-destructive";
	if (status === "early") return "wwc:text-success";
	return "wwc:text-foreground";
}

/* ------------------------------------------------------------------ *
 * Search-field helpers (rail ↔ detail ↔ shrink-ghost) — self-contained.
 * ------------------------------------------------------------------ */
function DashboardSearchField({
	value,
	onChange,
	onKeyDown,
	placeholder,
	className,
	inputClassName,
	children,
}: {
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
	children?: ReactNode;
}) {
	return (
		<div
			className={cn(
				"wwc:overflow-hidden wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:shadow-lg",
				className,
			)}
		>
			<div className="wwc:relative">
				<Search className="wwc:pointer-events-none wwc:absolute wwc:left-3 wwc:top-1/2 wwc:size-5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
				<Input
					value={value}
					onChange={onChange}
					onKeyDown={onKeyDown}
					placeholder={placeholder}
					className={cn(
						"wwc:h-12 wwc:rounded-xl wwc:border-0 wwc:bg-transparent wwc:pl-11 wwc:text-base wwc:shadow-none wwc:focus-visible:ring-0",
						inputClassName,
					)}
				/>
				{children}
			</div>
		</div>
	);
}

/**
 * The rail search FILTER menu — a Popover anchored to a filter button in the search field. Four collapsible
 * sections (Batch · Block · Milestone · Variance); tapping an option toggles a filter. Selection lives in the
 * host (`filters`/`onFiltersChange`) so the map, 3D and chip bar all react to the same list.
 */
function FilterMenu({
	filters,
	options,
	onChange,
}: {
	filters: CaptureFilter[];
	options: CaptureFilterOptions;
	onChange: (filters: CaptureFilter[]) => void;
}) {
	const isOn = (kind: CaptureFilterKind, value: string) => filters.some((f) => f.kind === kind && f.value === value);
	const toggle = (kind: CaptureFilterKind, opt: CaptureFilterOption) => {
		onChange(
			isOn(kind, opt.value)
				? filters.filter((f) => !(f.kind === kind && f.value === opt.value))
				: [...filters, {kind, value: opt.value, label: opt.label}],
		);
	};
	const sections: {kind: CaptureFilterKind; title: string; opts: CaptureFilterOption[]}[] = [
		{kind: "batch", title: "Batch", opts: options.batches},
		{kind: "block", title: "Block", opts: options.blocks},
		{kind: "milestone", title: "Milestone", opts: options.milestones},
		{kind: "variance", title: "Variance", opts: options.variances},
	];
	const countFor = (kind: CaptureFilterKind) => filters.filter((f) => f.kind === kind).length;
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label="Filter"
					className="wwc:relative wwc:flex wwc:size-8 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground"
				>
					<SlidersHorizontal className="wwc:size-5" />
					{filters.length > 0 && (
						<span className="wwc:absolute wwc:-right-0.5 wwc:-top-0.5 wwc:flex wwc:size-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-primary wwc:text-[10px] wwc:font-semibold wwc:text-primary-foreground">
							{filters.length}
						</span>
					)}
				</button>
			</PopoverTrigger>
			{/* Anchor the popover to the side panel's right edge (the search field spans the panel width; `-right-2`
          cancels the button group's `right-2` inset) so it opens to the RIGHT of the panel, not the button. */}
			<PopoverAnchor className="wwc:pointer-events-none wwc:absolute wwc:-right-2 wwc:top-0 wwc:h-8 wwc:w-0" />
			<PopoverContent side="right" align="start" sideOffset={4} className="wwc:w-72 wwc:p-0">
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:py-3">
					<span className="wwc:text-sm wwc:font-semibold">Filters</span>
					{filters.length > 0 && (
						<button
							type="button"
							onClick={() => onChange([])}
							className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground"
						>
							Clear all
						</button>
					)}
				</div>
				<Separator />
				<Accordion type="multiple" className="wwc:max-h-80 wwc:overflow-y-auto">
					{sections.map((section) => (
						<AccordionItem key={section.kind} value={section.kind} className="wwc:border-b wwc:border-border wwc:px-4">
							<AccordionTrigger className="wwc:py-3 wwc:text-sm wwc:font-medium">
								<span className="wwc:flex wwc:items-center wwc:gap-2">
									{section.title}
									{countFor(section.kind) > 0 && (
										<Badge variant="secondary" className="wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
											{countFor(section.kind)}
										</Badge>
									)}
								</span>
							</AccordionTrigger>
							<AccordionContent className="wwc:pb-2">
								<div className="wwc:flex wwc:flex-col wwc:gap-0.5">
									{section.opts.length === 0 && (
										<span className="wwc:px-1 wwc:py-1 wwc:text-xs wwc:text-muted-foreground">No options.</span>
									)}
									{section.opts.map((opt) => (
										<button
											key={opt.value}
											type="button"
											onClick={() => toggle(section.kind, opt)}
											className={cn(
												"wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:text-left wwc:text-sm wwc:transition-colors wwc:hover:bg-accent",
												isOn(section.kind, opt.value) && "wwc:bg-accent",
											)}
										>
											<span className="wwc:truncate">{opt.label}</span>
											{isOn(section.kind, opt.value) && <Check className="wwc:size-4 wwc:text-primary" />}
										</button>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</PopoverContent>
		</Popover>
	);
}

/**
 * The villa detail panel's search bar — the exact same `DashboardSearchField` as the sidebar rail. It
 * animates its width open from the rail's base width (320px) to full when the panel mounts.
 */
function VillaDetailSearch({
	value,
	onChange,
	onKeyDown,
	onClose,
	placeholder,
}: {
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
	onClose: () => void;
	placeholder?: string;
}) {
	const [expanded, setExpanded] = useState(false);
	useEffect(() => {
		const id = requestAnimationFrame(() => setExpanded(true));
		return () => cancelAnimationFrame(id);
	}, []);
	return (
		<DashboardSearchField
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			placeholder={placeholder}
			inputClassName="wwc:pr-12"
			className={cn(
				"wwc:pointer-events-auto wwc:shadow-lg wwc:transition-[width] wwc:duration-300 wwc:ease-out",
				expanded ? "wwc:w-full" : "wwc:w-[320px]",
			)}
		>
			<button
				type="button"
				aria-label="Close villa details"
				onClick={onClose}
				className="wwc:absolute wwc:right-2 wwc:top-1/2 wwc:flex wwc:size-8 wwc:-translate-y-1/2 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground"
			>
				<X className="wwc:size-5" />
			</button>
		</DashboardSearchField>
	);
}

/**
 * A brief, non-interactive copy of the rail search bar that plays the shrink from the villa-details width
 * back to the rail's base width right after the villa panel closes, then removes itself.
 */
function RailSearchShrinkGhost({
	query,
	searching,
	placeholder,
	onDone,
}: {
	query: string;
	searching: boolean;
	placeholder: string;
	onDone: () => void;
}) {
	const [shrunk, setShrunk] = useState(false);
	useEffect(() => {
		const raf = requestAnimationFrame(() => setShrunk(true));
		const t = window.setTimeout(onDone, 320);
		return () => {
			cancelAnimationFrame(raf);
			window.clearTimeout(t);
		};
		// Run once for the ghost's lifetime; onDone only flips a stable setter.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className="wwc:pointer-events-none wwc:absolute wwc:left-3 wwc:top-3 wwc:z-30">
			<DashboardSearchField
				value={query}
				onChange={() => {}}
				placeholder={placeholder}
				inputClassName="wwc:pr-20"
				className={cn(
					"wwc:transition-[width] wwc:duration-300 wwc:ease-out",
					shrunk ? "wwc:w-[320px]" : "wwc:w-[376px]",
				)}
			>
				<div className="wwc:absolute wwc:right-2 wwc:top-1/2 wwc:flex wwc:-translate-y-1/2 wwc:items-center wwc:gap-0.5">
					{searching ? (
						<span className="wwc:flex wwc:size-8 wwc:items-center wwc:justify-center wwc:text-muted-foreground">
							<X className="wwc:size-5" />
						</span>
					) : null}
					<span className="wwc:flex wwc:size-8 wwc:items-center wwc:justify-center wwc:text-muted-foreground">
						<ChevronUp className="wwc:size-5" />
					</span>
				</div>
			</DashboardSearchField>
		</div>
	);
}

/** Find a node by id anywhere in the navigator tree (leaves + branches). */
function findNode(nodes: CanvasNavigatorNode[], id: string): CanvasNavigatorNode | null {
	for (const n of nodes) {
		if (n.id === id) return n;
		if (n.children) {
			const c = findNode(n.children, id);
			if (c) return c;
		}
	}
	return null;
}

/* ------------------------------------------------------------------ *
 * Props
 * ------------------------------------------------------------------ */
export type SitePanelProps = {
	// ---- view axes (read-only) ----
	view: ViewId;
	mode: ViewMode; // stepper is inert in 3D
	level: LevelId;
	activeLevel: {id: LevelId; label: string; icon: ComponentType<{className?: string}>};
	currentLocation: string;
	locationLabel: string;
	locationIndex: number;

	// ---- rows / nouns (host-derived) ----
	isParent: boolean;
	activeRows: SitePanelVilla[];
	unitNoun: string;
	unitNounSingular: string;
	countNoun: string;

	// ---- selection / detail ----
	selectedId: string;
	detailOpen: boolean;
	detailVilla?: CaptureDetailVilla;
	selected?: SitePanelVilla;
	selectedNumber?: string;
	selectedBatch?: string;
	selectedPath?: string;

	// ---- colour mode + distribution ----
	mapMode: MapMode;
	distribution: SitePanelDistributionBucket[];

	// ---- navigator ----
	navNodes: CanvasNavigatorNode[];

	// ---- geometry / chrome ----
	chromeFade: string;
	maxPanelH?: number;

	// ---- detail-tab visibility (host props pass-through) ----
	hideFloors?: boolean;
	hideEvidence?: boolean;
	hideActivities?: boolean;
	hideMilestones?: boolean;
	hideSearch?: boolean;

	// ---- search open (shared: crosses to Layers offset) ----
	searchOpen: boolean;
	/**
	 * Search text. Optional CONTROLLED seam: when provided, the host owns the query (so it can filter the map +
	 * 3D to the same subset the rail list shows) and must pair it with `onQueryChange`. Omit both to keep the
	 * self-contained local behaviour (list-only filtering) other consumers rely on.
	 */
	query?: string;
	onQueryChange?: (q: string) => void;
	/** Active search filters (host-owned) + the options to offer. When both are set, the rail shows the filter
	 *  button/menu; the host renders the chips + applies them. Omit to hide the filter affordance entirely. */
	filters?: CaptureFilter[];
	onFiltersChange?: (filters: CaptureFilter[]) => void;
	filterOptions?: CaptureFilterOptions;

	// ---- fallback Blueprints dialog labels (only used when `onOpenBlueprints` is unset) ----
	/** Selected capture/week id, shown in the fallback Blueprints dialog description. */
	captureId?: string;
	/** Selected week's date-range label, shown in the fallback Blueprints dialog description. */
	rangeLabel?: string;

	// ================= CALLBACKS OUT =================
	onSelectVilla: (id: string) => void; // list row / navigator leaf → openVilla
	onCloseDetail: () => void; // detail X / Escape
	onStepLocation: (dir: -1 | 1) => void; // stepper prev/next
	onOpenNavigator?: () => void; // current-location card (also drives local navigatorOpen)
	onNavigate: (node: CanvasNavigatorNode) => void; // navigator onSelect → runMapTransition
	onDrillDown?: (id: string) => void; // parent-list drill (reserved)
	onMapModeChange: (m: MapMode) => void; // SPA/Progress tabs
	onSearchOpenChange: (open: boolean) => void; // full-height panel open/close
	onPanelResize?: (el: HTMLElement | null) => void; // host measures the rail element

	// detail-rail actions (forwarded to host props)
	onOpenBlueprints?: (villa: CaptureDetailVilla) => void;
	onOpenWalkthrough?: (villa: CaptureDetailVilla) => void;
	onOpenProgressDetails?: (villa: CaptureDetailVilla) => void;
};

/* ------------------------------------------------------------------ *
 * SitePanel
 * ------------------------------------------------------------------ */
export function SitePanel(props: SitePanelProps) {
	const {
		mode,
		level,
		currentLocation,
		locationLabel,
		isParent,
		activeRows,
		unitNoun,
		countNoun,
		selectedId,
		detailOpen,
		detailVilla,
		selectedNumber,
		selectedPath,
		mapMode,
		distribution,
		navNodes,
		chromeFade,
		maxPanelH,
		hideFloors,
		hideEvidence,
		hideActivities,
		hideMilestones,
		hideSearch,
		searchOpen,
		captureId,
		rangeLabel,
		onSelectVilla,
		onCloseDetail,
		onStepLocation,
		onOpenNavigator,
		onNavigate,
		onMapModeChange,
		onSearchOpenChange,
		onPanelResize,
		onOpenBlueprints,
		onOpenWalkthrough,
		onOpenProgressDetails,
	} = props;

	// The rail's "selected" row — fall back to the first row so the detail body never dereferences undefined.
	const selected: SitePanelVilla = props.selected ?? activeRows.find((v) => v.id === selectedId) ?? activeRows[0];
	const detailNumber = selectedNumber ?? selected?.name.match(/^\d+/)?.[0] ?? selected?.name ?? "";
	const variance = (selected?.approved ?? 0) - (selected?.planned ?? 0);

	// ---- local UI state ----
	// Query is controlled when the host passes `query`/`onQueryChange` (so it can filter the map to match the
	// list); otherwise it falls back to this local state so standalone consumers keep working unchanged.
	const [queryLocal, setQueryLocal] = useState("");
	const query = props.query ?? queryLocal;
	const setQuery = (v: string) => {
		if (props.query === undefined) setQueryLocal(v);
		props.onQueryChange?.(v);
	};
	const [searchLevels, setSearchLevels] = useState<LevelKind[]>([]);
	const [searchSort, setSearchSort] = useState<SearchSort>("relevance");
	const [sortMenuOpen, setSortMenuOpen] = useState(false);
	const [railCollapsed, setRailCollapsed] = useState(false);
	const [navigatorOpen, setNavigatorOpen] = useState(false);
	const [railGhost, setRailGhost] = useState(false);
	const [detailTab, setDetailTab] = useState("overview");
	const [evidenceTab, setEvidenceTab] = useState("360");
	const [blueprintsOpen, setBlueprintsOpen] = useState(false);

	// Auto-hiding overlay scrollbar for the villa detail panel.
	const detailScrollRef = useRef<HTMLDivElement>(null);
	const [detailScrollbar, setDetailScrollbar] = useState({top: 0, height: 0, visible: false});
	const detailScrollbarTimer = useRef<number | null>(null);
	const pingDetailScrollbar = () => {
		const el = detailScrollRef.current;
		if (!el) return;
		const {scrollTop, scrollHeight, clientHeight} = el;
		const trackH = Math.max(0, clientHeight - 72);
		if (scrollHeight <= clientHeight + 1 || trackH <= 0) {
			setDetailScrollbar((s) => ({...s, visible: false}));
			return;
		}
		const thumbH = Math.max(28, (clientHeight / scrollHeight) * trackH);
		const top = (scrollTop / (scrollHeight - clientHeight)) * (trackH - thumbH);
		setDetailScrollbar({top, height: thumbH, visible: true});
		if (detailScrollbarTimer.current != null) window.clearTimeout(detailScrollbarTimer.current);
		detailScrollbarTimer.current = window.setTimeout(() => setDetailScrollbar((s) => ({...s, visible: false})), 1000);
	};

	// If a hidden detail tab is the active one, fall back to Overview (Overview is never hideable).
	useEffect(() => {
		if (
			(hideFloors && detailTab === "floors") ||
			(hideEvidence && detailTab === "evidence") ||
			(hideActivities && detailTab === "activities")
		) {
			setDetailTab("overview");
		}
	}, [hideFloors, hideEvidence, hideActivities, detailTab]);

	// ---- derivations from the (prop) rows + local search state ----
	const zone = useMemo(() => {
		if (!activeRows.length) return {approved: 0, planned: 0, variance: 0};
		const approved = activeRows.reduce((s, v) => s + v.approved, 0) / activeRows.length;
		const planned = activeRows.reduce((s, v) => s + v.planned, 0) / activeRows.length;
		return {approved, planned, variance: approved - planned};
	}, [activeRows]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return activeRows;
		return activeRows.filter((v) => v.name.toLowerCase().includes(q) || v.meta.toLowerCase().includes(q));
	}, [query, activeRows]);

	const searchLevelCounts = useMemo(() => {
		const q = query.trim().toLowerCase();
		const counts: Record<LevelKind, number> = {villa: 0, batch: 0, zone: 0, phase: 0};
		for (const lv of SEARCH_LEVELS)
			counts[lv.kind] = lv.rows.filter(
				(v) => !q || v.name.toLowerCase().includes(q) || v.meta.toLowerCase().includes(q),
			).length;
		return counts;
	}, [query]);

	const searchResults = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q && !searchLevels.length) return [] as (SitePanelVilla & {levelLabel: string; levelKind: LevelKind})[];
		const active = searchLevels.length ? searchLevels : SEARCH_LEVELS.map((l) => l.kind);
		const out: (SitePanelVilla & {levelLabel: string; levelKind: LevelKind})[] = [];
		for (const lv of SEARCH_LEVELS) {
			if (!active.includes(lv.kind)) continue;
			for (const v of lv.rows)
				if (!q || v.name.toLowerCase().includes(q) || v.meta.toLowerCase().includes(q))
					out.push({...v, levelLabel: lv.singular, levelKind: lv.kind});
		}
		return out;
	}, [query, searchLevels]);

	const resultsLabel =
		searchLevels.length === 1
			? `${searchResults.length} ${SEARCH_LEVELS.find((l) => l.kind === searchLevels[0])?.label.toLowerCase() ?? "results"}`
			: `${searchResults.length} results`;

	const sortedResults = useMemo(() => {
		if (searchSort === "relevance") return searchResults;
		const nameOf = (r: (typeof searchResults)[number]) =>
			r.levelKind === "villa" ? (r.name.match(/^\d+/)?.[0] ?? r.name) : r.name;
		const rows = [...searchResults];
		switch (searchSort) {
			case "alpha-asc":
				return rows.sort((a, b) => nameOf(a).localeCompare(nameOf(b), undefined, {numeric: true}));
			case "alpha-desc":
				return rows.sort((a, b) => nameOf(b).localeCompare(nameOf(a), undefined, {numeric: true}));
			case "progress-asc":
				return rows.sort((a, b) => a.approved - b.approved);
			case "progress-desc":
				return rows.sort((a, b) => b.approved - a.approved);
			default:
				return rows;
		}
	}, [searchResults, searchSort]);

	// ---- search state machine (local) ----
	const searching = query.trim().length > 0;
	// Block isn't its own search catalog (SEARCH_LEVELS is villa/batch/zone/phase), so the block level's
	// "search this level" scope falls back to its parent Batch.
	const currentLevelKind: LevelKind = !isParent ? "villa" : level === "block" ? "batch" : level;
	const openSearch = (scope: "level" | "all") => {
		if (!searching) return;
		setSearchLevels(scope === "level" ? [currentLevelKind] : []);
		onSearchOpenChange(true);
	};
	const openLevelList = () => {
		setQuery("");
		setSearchLevels([currentLevelKind]);
		onSearchOpenChange(true);
	};
	const closeSearch = () => {
		onSearchOpenChange(false);
		setSearchLevels([]);
		setQuery("");
	};
	const toggleSearchLevel = (kind: LevelKind) =>
		setSearchLevels((prev) => (prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]));

	const openNavigator = () => {
		setNavigatorOpen(true);
		onOpenNavigator?.();
	};
	// Detail X / Escape — close instantly (host) + replay the rail shrink ghost.
	const handleCloseDetail = () => {
		onCloseDetail();
		setRailGhost(true);
	};

	const showFullSearch = searchOpen && !hideSearch;

	return (
		<>
			{navigatorOpen ? (
				/* Canvas navigator — replaces the rail; close with the header X (the collapse control). */
				<CanvasNavigator
					className={cn("wwc:absolute wwc:left-3 wwc:top-3 wwc:z-30 wwc:w-[320px]", chromeFade)}
					nodes={navNodes}
					value={currentLocation}
					size="default"
					expandable={false}
					title="ALMANAR – PHASE1"
					collapseIcon={<X className="wwc:size-4" />}
					onSizeChange={(s) => {
						if (s === "collapsed") setNavigatorOpen(false);
					}}
					onSelect={(id) => {
						const node = findNode(navNodes, id);
						if (node) onNavigate(node);
						setNavigatorOpen(false);
					}}
				/>
			) : showFullSearch ? (
				/* Full-height search results panel. */
				<aside
					className={cn(
						"wwc:absolute wwc:inset-y-0 wwc:left-0 wwc:z-30 wwc:flex wwc:w-[360px] wwc:flex-col wwc:overflow-hidden wwc:border-r wwc:border-border wwc:bg-card wwc:shadow-xl",
						chromeFade,
					)}
				>
					{/* Search input */}
					<div className="wwc:shrink-0 wwc:p-3">
						<div className="wwc:relative">
							<Search className="wwc:pointer-events-none wwc:absolute wwc:left-3 wwc:top-1/2 wwc:size-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
							<Input
								autoFocus
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Escape") closeSearch();
								}}
								placeholder="Search..."
								className="wwc:pl-9 wwc:pr-10"
							/>
							<button
								type="button"
								aria-label="Close search"
								onClick={closeSearch}
								className="wwc:absolute wwc:right-2 wwc:top-1/2 wwc:flex wwc:size-6 wwc:-translate-y-1/2 wwc:items-center wwc:justify-center wwc:rounded-full wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground"
							>
								<X className="wwc:size-4" />
							</button>
						</div>
					</div>

					{/* Searching for — per-level filter toggles + match counts. None selected = all levels. */}
					<div className="wwc:shrink-0 wwc:px-3">
						<span className="wwc:text-xs wwc:text-muted-foreground">Searching for</span>
						<div className="wwc:mt-2 wwc:flex wwc:items-stretch wwc:gap-1">
							{SEARCH_LEVELS.map((lv) => {
								const on = searchLevels.includes(lv.kind);
								const LvIcon = lv.icon;
								return (
									<button
										key={lv.kind}
										type="button"
										aria-pressed={on}
										title={lv.label}
										onClick={() => toggleSearchLevel(lv.kind)}
										className="wwc:flex wwc:flex-1 wwc:flex-col wwc:items-center wwc:gap-1"
									>
										<span
											className={cn(
												"wwc:flex wwc:h-8 wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-full wwc:transition-colors",
												on ? "wwc:bg-primary/10 wwc:text-primary" : "wwc:text-foreground wwc:hover:bg-accent",
											)}
										>
											<LvIcon className="wwc:size-4" />
										</span>
										<span
											className={cn(
												"wwc:text-xs",
												on ? "wwc:font-semibold wwc:text-foreground" : "wwc:text-muted-foreground",
											)}
										>
											{searchLevelCounts[lv.kind]}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Results header — title on the left; result count + sort menu on the right. */}
					<div className="wwc:mt-3 wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:border-b wwc:border-border wwc:px-3 wwc:pb-2">
						<span className="wwc:text-base wwc:font-semibold">Results</span>
						<div className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className="wwc:text-sm wwc:text-muted-foreground">{resultsLabel}</span>
							<Popover open={sortMenuOpen} onOpenChange={setSortMenuOpen}>
								<PopoverTrigger asChild>
									<button
										type="button"
										aria-label="Sort results"
										className="wwc:flex wwc:size-7 wwc:items-center wwc:justify-center wwc:rounded-md wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground wwc:aria-expanded:bg-accent"
									>
										<ArrowUpDown className="wwc:size-4" />
									</button>
								</PopoverTrigger>
								<PopoverContent side="bottom" align="end" sideOffset={6} className="wwc:w-48 wwc:p-1">
									{SEARCH_SORTS.map((s) => (
										<button
											key={s.id}
											type="button"
											onClick={() => {
												setSearchSort(s.id);
												setSortMenuOpen(false);
											}}
											className={cn(
												"wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:gap-2 wwc:rounded-md wwc:px-2.5 wwc:py-2 wwc:text-left wwc:text-sm wwc:transition-colors",
												searchSort === s.id
													? "wwc:bg-primary/10 wwc:font-medium wwc:text-primary"
													: "wwc:text-foreground wwc:hover:bg-accent",
											)}
										>
											{s.label}
											{searchSort === s.id ? <Check className="wwc:size-4 wwc:shrink-0" /> : null}
										</button>
									))}
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Result rows — each tagged with its level on the right. */}
					<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-0.5 wwc:overflow-auto wwc:p-2">
						{sortedResults.length > 0 ? (
							sortedResults.map((r) => (
								<div
									key={`${r.levelKind}-${r.id}`}
									className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2.5 wwc:py-2 wwc:transition-colors wwc:hover:bg-accent"
								>
									<span
										className="wwc:size-2 wwc:shrink-0 wwc:rounded-full"
										style={{backgroundColor: r.levelKind === "villa" ? villaColor(r, mapMode) : MONOCHROME_STYLE.fill}}
									/>
									<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-sm wwc:font-medium">
										{r.levelKind === "villa" ? (r.name.match(/^\d+/)?.[0] ?? r.name) : r.name}
									</span>
									<span className="wwc:shrink-0 wwc:rounded wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
										{r.levelLabel}
									</span>
									{/* Progress hidden for parent grouping rows (block/zone/batch/phase); shown only for villas. */}
									{r.levelKind === "villa" && (
										<span className="wwc:w-10 wwc:shrink-0 wwc:text-right wwc:text-sm wwc:font-semibold">
											{r.approved}%
										</span>
									)}
								</div>
							))
						) : (
							<p className="wwc:px-2 wwc:py-10 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
								No matches for “{query}”.
							</p>
						)}
					</div>
				</aside>
			) : detailOpen ? null : (
				/* Floating left panel — overlays the map canvas; hidden while the detail panel is open. */
				<aside
					ref={onPanelResize}
					style={{maxHeight: maxPanelH}}
					className={cn(
						"wwc:absolute wwc:left-3 wwc:top-3 wwc:z-20 wwc:flex wwc:w-[320px] wwc:flex-col wwc:gap-1 wwc:overflow-y-auto",
						chromeFade,
					)}
				>
					{/* Search */}
					{!hideSearch && (
						<DashboardSearchField
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								if (e.target.value) setRailCollapsed(false);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") openSearch("level");
								if (e.key === "Escape") closeSearch();
							}}
							placeholder={`Search ${unitNoun}...`}
							className="wwc:shrink-0"
							inputClassName="wwc:pr-28"
						>
							<div className="wwc:absolute wwc:right-2 wwc:top-1/2 wwc:flex wwc:-translate-y-1/2 wwc:items-center wwc:gap-0.5">
								{searching ? (
									<button
										type="button"
										aria-label="Clear search"
										onClick={() => setQuery("")}
										className="wwc:flex wwc:size-8 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground"
									>
										<X className="wwc:size-5" />
									</button>
								) : null}
								{props.filterOptions && props.onFiltersChange ? (
									<FilterMenu
										filters={props.filters ?? []}
										options={props.filterOptions}
										onChange={props.onFiltersChange}
									/>
								) : null}
								<button
									type="button"
									aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
									aria-expanded={!railCollapsed}
									onClick={() => setRailCollapsed((c) => !c)}
									className="wwc:flex wwc:size-8 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground"
								>
									<ChevronUp className={cn("wwc:size-5 wwc:transition-transform", railCollapsed && "wwc:rotate-180")} />
								</button>
							</div>
						</DashboardSearchField>
					)}

					{/* Everything below the search bar collapses together when the sidebar is collapsed. */}
					{!railCollapsed && (
						<>
							{/* While typing, the rail collapses to the search box + two scope options. */}
							{searching ? (
								<div className="wwc:shrink-0 wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-1 wwc:shadow-lg">
									{[
										{scope: "level" as const, icon: Search, label: `Search in ${unitNoun}`},
										{scope: "all" as const, icon: Layers, label: "Search all levels"},
									].map((opt) => {
										const OptIcon = opt.icon;
										return (
											<button
												key={opt.scope}
												type="button"
												onClick={() => openSearch(opt.scope)}
												className="wwc:flex wwc:w-full wwc:items-center wwc:gap-3 wwc:rounded-md wwc:px-2 wwc:py-2.5 wwc:text-left wwc:transition-colors wwc:hover:bg-accent"
											>
												<span className="wwc:flex wwc:size-9 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted wwc:text-muted-foreground">
													<OptIcon className="wwc:size-4" />
												</span>
												<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
													<span className="wwc:truncate wwc:text-sm wwc:font-semibold">{opt.label}</span>
													<span className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">“{query}”</span>
												</span>
												<ChevronRight className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
											</button>
										);
									})}
								</div>
							) : (
								<>
									{/* Current-location stepper — prev/next cycle through the site's locations. */}
									<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-2 wwc:shadow-lg">
										<Button
											icon
											size="sm"
											variant="outline"
											aria-label="Previous location"
											className="wwc:shrink-0 wwc:rounded-full"
											onClick={() => onStepLocation(-1)}
											disabled={mode === "3d"}
										>
											<ChevronLeft className="wwc:size-4" />
										</Button>
										<button
											type="button"
											onClick={openNavigator}
											aria-label="Open location navigator"
											disabled={mode === "3d"}
											className={cn(
												"wwc:group wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:items-center wwc:rounded-md wwc:py-0.5 wwc:transition-colors wwc:hover:bg-accent",
												mode === "3d" && "wwc:pointer-events-none wwc:opacity-60 wwc:hover:bg-transparent",
											)}
										>
											<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
												Current location
											</span>
											<span className="wwc:truncate wwc:text-sm wwc:font-semibold wwc:transition-colors wwc:group-hover:text-primary">
												{locationLabel}
											</span>
										</button>
										<Button
											icon
											size="sm"
											variant="outline"
											aria-label="Next location"
											className="wwc:shrink-0 wwc:rounded-full"
											onClick={() => onStepLocation(1)}
											disabled={mode === "3d"}
										>
											<ChevronRight className="wwc:size-4" />
										</Button>
									</div>

									{/* Zone progress */}
									<div className="wwc:shrink-0 wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:shadow-lg">
										<div className="wwc:p-3">
											<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
												Zone progress
											</span>
											<div className="wwc:mt-2 wwc:flex wwc:flex-row wwc:items-end wwc:gap-4">
												<div className="wwc:flex wwc:min-w-0 wwc:flex-col">
													<span className="wwc:text-xl wwc:font-semibold">{zone.approved.toFixed(2)}%</span>
													<span className="wwc:text-xs wwc:text-muted-foreground">Approved</span>
												</div>
												<div className="wwc:flex wwc:min-w-0 wwc:flex-col">
													<span className="wwc:text-xl wwc:font-semibold">{zone.planned.toFixed(2)}%</span>
													<span className="wwc:text-xs wwc:text-muted-foreground">Planned</span>
												</div>
												<div className="wwc:flex wwc:min-w-0 wwc:flex-col">
													<span className="wwc:text-xl wwc:font-semibold wwc:text-destructive">
														{zone.variance.toFixed(2)}%
													</span>
													<span className="wwc:text-xs wwc:text-muted-foreground">Variance</span>
												</div>
											</div>
										</div>
									</div>

									{/* Progress distribution. The tabs always show so you can switch modes; on the parent grouping
									    levels (phase/zone/batch/block) the SPA tab hides its bar + metrics (values remain in data), while
									    the Progress tab still shows everything. */}
									<div className="wwc:shrink-0 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-3 wwc:shadow-lg">
										{/* SPA / Progress — shared with the map's colour mode. */}
										<Tabs value={mapMode} onValueChange={(v) => onMapModeChange(v as MapMode)}>
											<TabsList className="wwc:w-full">
												<TabsTrigger value="progress" className="wwc:flex-1">
													SPA
												</TabsTrigger>
												<TabsTrigger value="variance" className="wwc:flex-1">
													Progress
												</TabsTrigger>
											</TabsList>
										</Tabs>

										{/* SPA tab on a parent level hides the distribution detail; every other case shows it. */}
										{!(isParent && mapMode === "progress") && (
											<>
												<div className="wwc:mt-3 wwc:flex wwc:items-center wwc:justify-between">
													<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
														{mapMode === "variance" ? "Variance distribution" : "Progress distribution"}
													</span>
													<span className="wwc:text-xs wwc:text-muted-foreground">
														{activeRows.length} {countNoun}
													</span>
												</div>
												{/* Bar sized to the real distribution — each bucket's width ∝ its count. */}
												<div className="wwc:mt-2 wwc:flex wwc:h-2 wwc:w-full wwc:overflow-hidden wwc:rounded-full">
													{distribution
														.filter((d) => d.count > 0)
														.map((d) => (
															<div
																key={d.id}
																className="wwc:h-full"
																style={{flexGrow: d.count, flexBasis: 0, backgroundColor: d.color}}
															/>
														))}
												</div>
												{/* Per bucket: a coloured pill, the count, the label, and its progress range. */}
												<div className="wwc:mt-3 wwc:flex wwc:flex-row wwc:gap-2">
													{distribution.map((d) => (
														<div key={d.id} className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-1">
															<div className="wwc:h-1 wwc:w-full wwc:rounded-full" style={{backgroundColor: d.color}} />
															<span className="wwc:text-sm wwc:font-semibold">{d.count}</span>
															<span className="wwc:text-[10px] wwc:font-medium wwc:text-foreground">{d.label}</span>
															{d.range && (
																<span className="wwc:text-[10px] wwc:leading-tight wwc:text-muted-foreground">
																	{d.range}
																</span>
															)}
														</div>
													))}
												</div>
											</>
										)}
									</div>
								</>
							)}

							{/* Villas on map */}
							<div className="wwc:flex wwc:shrink-0 wwc:flex-col wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:shadow-lg">
								<button
									type="button"
									onClick={openLevelList}
									aria-label={`Show all ${unitNoun} on the map`}
									className="wwc:flex wwc:w-full wwc:shrink-0 wwc:items-center wwc:justify-between wwc:border-b wwc:border-border wwc:px-3 wwc:py-2.5 wwc:text-left wwc:transition-colors wwc:hover:bg-accent"
								>
									<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
										{isParent ? `${unitNoun[0].toUpperCase()}${unitNoun.slice(1)} on map` : "Villas on map"}
									</span>
									<Badge variant="secondary">{filtered.length}</Badge>
								</button>
								<div className="wwc:flex wwc:max-h-[280px] wwc:flex-col wwc:gap-1 wwc:overflow-auto wwc:p-2">
									{filtered.map((v) => {
										const active = v.id === selectedId;
										return (
											<button
												key={v.id}
												type="button"
												onClick={() => onSelectVilla(v.id)}
												className={cn(
													"wwc:flex wwc:w-full wwc:flex-row wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:border wwc:px-2.5 wwc:py-2 wwc:text-left wwc:transition-colors",
													active ? "wwc:border-primary wwc:bg-primary/5" : "wwc:border-transparent wwc:hover:bg-accent",
												)}
											>
												<span
													className="wwc:size-2 wwc:shrink-0 wwc:rounded-full"
													style={{backgroundColor: isParent ? MONOCHROME_STYLE.fill : villaColor(v, mapMode)}}
												/>
												<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
													<span
														className={cn("wwc:truncate wwc:text-sm wwc:font-medium", active && "wwc:text-primary")}
													>
														{isParent ? v.name : (v.name.match(/^\d+/)?.[0] ?? v.name)}
													</span>
													{isParent && v.meta ? (
														<span className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{v.meta}</span>
													) : null}
												</span>
												{/* Progress is hidden on the parent grouping levels (phase/zone/batch/block); values remain in data. */}
												{!isParent && <span className="wwc:shrink-0 wwc:text-sm wwc:font-semibold">{v.approved}%</span>}
											</button>
										);
									})}
									{filtered.length === 0 && (
										<p className="wwc:px-2 wwc:py-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
											No {unitNoun} match “{query}”.
										</p>
									)}
								</div>
							</div>
						</>
					)}
				</aside>
			)}

			{/* Rail search shrink — plays the villa-details → rail width collapse after an instant close. */}
			{railGhost && !detailOpen && !searchOpen && !navigatorOpen && (
				<RailSearchShrinkGhost
					query={query}
					searching={searching}
					placeholder={`Search ${unitNoun}...`}
					onDone={() => setRailGhost(false)}
				/>
			)}

			{/* Villa detail panel. */}
			{detailOpen && selected && (
				<aside
					className={cn(
						"wwc:absolute wwc:inset-y-0 wwc:left-0 wwc:z-30 wwc:flex wwc:w-[400px] wwc:flex-col wwc:overflow-hidden wwc:border-r wwc:border-border wwc:bg-card wwc:shadow-xl",
						chromeFade,
					)}
				>
					{/* Floating search bar — pinned over the top (stays put as the panel scrolls). */}
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:top-0 wwc:z-10 wwc:p-3">
						<VillaDetailSearch
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && query.trim()) {
									onCloseDetail();
									openSearch("all");
								}
								if (e.key === "Escape") handleCloseDetail();
							}}
							onClose={handleCloseDetail}
							placeholder="Search villas, zones, plots..."
						/>
					</div>

					{/* Scrollable information panel — native scrollbar hidden; overlay thumb floats + auto-hides. */}
					<div
						ref={detailScrollRef}
						onScroll={pingDetailScrollbar}
						onMouseEnter={pingDetailScrollbar}
						style={{scrollbarWidth: "none"}}
						className="hide-native-scrollbar wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-auto"
					>
						{/* Header — villa number + type/location (no hero image). */}
						<div className="wwc:flex wwc:shrink-0 wwc:flex-col wwc:px-4 wwc:pb-3 wwc:pt-[85px]">
							<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
								Villa
							</span>
							<span className="wwc:truncate wwc:text-2xl wwc:font-semibold">{detailNumber}</span>
							<span className="wwc:mt-0.5 wwc:truncate wwc:text-sm wwc:text-muted-foreground">
								{villaTypeLabel(selected.name)} · {locationLabel}
							</span>
						</div>

						{/* Tabs — Overview / Floors / Evidence / Activities. */}
						<Tabs value={detailTab} onValueChange={setDetailTab} variant="underline" className="wwc:shrink-0 wwc:pb-6">
							<div className="wwc:px-4 wwc:pt-3">
								<TabsList className="wwc:w-full">
									<TabsTrigger value="overview">Overview</TabsTrigger>
									{!hideFloors && <TabsTrigger value="floors">Floors</TabsTrigger>}
									{!hideEvidence && <TabsTrigger value="evidence">Evidence</TabsTrigger>}
									{!hideActivities && <TabsTrigger value="activities">Activities</TabsTrigger>}
								</TabsList>
							</div>

							{/* Overview — stats, dual progress, milestones, location path. */}
							<TabsContent value="overview" className="wwc:flex wwc:flex-col">
								{/* Actions — a grey square (bg-secondary filling the whole button cell) with the icon and its
                    label stacked inside it (icon above, label under). The three squares sit 4px apart (gap-1). */}
								<div className="wwc:grid wwc:grid-cols-3 wwc:gap-1 wwc:px-4 wwc:py-4">
									<button
										type="button"
										onClick={() =>
											onOpenBlueprints && detailVilla ? onOpenBlueprints(detailVilla) : setBlueprintsOpen(true)
										}
										aria-label="Blueprints"
										className="wwc:group wwc:w-full"
									>
										<span className="wwc:flex wwc:aspect-square wwc:w-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:rounded-lg wwc:bg-secondary wwc:px-2 wwc:text-center wwc:text-foreground wwc:transition-colors wwc:group-hover:bg-secondary/70">
											<Ruler className="wwc:size-5" />
											<span className="wwc:text-xs wwc:font-medium">Blueprints</span>
										</span>
									</button>
									<button
										type="button"
										onClick={onOpenWalkthrough && detailVilla ? () => onOpenWalkthrough(detailVilla) : undefined}
										aria-label="360 walkthrough"
										className="wwc:group wwc:w-full"
									>
										<span className="wwc:flex wwc:aspect-square wwc:w-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:rounded-lg wwc:bg-secondary wwc:px-2 wwc:text-center wwc:text-foreground wwc:transition-colors wwc:group-hover:bg-secondary/70">
											<Rotate3d className="wwc:size-5" />
											<span className="wwc:text-xs wwc:font-medium">360 Walkthrough</span>
										</span>
									</button>
									<button
										type="button"
										onClick={
											onOpenProgressDetails && detailVilla ? () => onOpenProgressDetails(detailVilla) : undefined
										}
										aria-label="Progress details"
										className="wwc:group wwc:w-full"
									>
										<span className="wwc:flex wwc:aspect-square wwc:w-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:rounded-lg wwc:bg-secondary wwc:px-2 wwc:text-center wwc:text-foreground wwc:transition-colors wwc:group-hover:bg-secondary/70">
											<BarChart3 className="wwc:size-5" />
											<span className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:text-xs wwc:font-medium">
												Progress Details
												<ArrowUpRight className="wwc:size-3.5 wwc:text-muted-foreground" />
											</span>
										</span>
									</button>
								</div>

								<Separator />

								{/* Stats + dual progress bars. */}
								<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:px-4 wwc:py-4">
									{/* SPA / Progress switch (segmented tabs) — shares mapMode with the left rail. */}
									<Tabs value={mapMode} onValueChange={(v) => onMapModeChange(v as MapMode)}>
										<TabsList className="wwc:w-full">
											<TabsTrigger value="progress" className="wwc:flex-1">
												SPA
											</TabsTrigger>
											<TabsTrigger value="variance" className="wwc:flex-1">
												Progress
											</TabsTrigger>
										</TabsList>
									</Tabs>
									<div className="wwc:grid wwc:grid-cols-3 wwc:gap-2">
										<div className="wwc:rounded-lg wwc:border wwc:border-border wwc:p-3">
											<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
												Approved
											</span>
											<p className="wwc:mt-1 wwc:text-2xl wwc:font-semibold">{selected.approved}%</p>
										</div>
										<div className="wwc:rounded-lg wwc:border wwc:border-border wwc:p-3">
											<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
												Planned
											</span>
											<p className="wwc:mt-1 wwc:text-2xl wwc:font-semibold">{selected.planned}%</p>
										</div>
										<div
											className={cn(
												"wwc:rounded-lg wwc:border wwc:p-3",
												variance < 0
													? "wwc:border-destructive/40 wwc:bg-destructive/5"
													: "wwc:border-success/40 wwc:bg-success/5",
											)}
										>
											<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
												Variance
											</span>
											<p
												className={cn(
													"wwc:mt-1 wwc:text-2xl wwc:font-semibold",
													variance < 0 ? "wwc:text-destructive" : "wwc:text-success",
												)}
											>
												{variance > 0 ? "+" : ""}
												{variance}%
											</p>
											<span
												className={cn(
													"wwc:text-[11px] wwc:font-medium",
													variance < 0 ? "wwc:text-destructive" : "wwc:text-success",
												)}
											>
												{variance < 0 ? "Behind" : "Ahead"}
											</span>
										</div>
									</div>

									<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
										<div className="wwc:h-1.5 wwc:w-full wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
											<div
												className="wwc:h-full wwc:rounded-full wwc:bg-primary"
												style={{width: `${selected.approved}%`}}
											/>
										</div>
										<div className="wwc:h-1.5 wwc:w-full wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
											<div
												className="wwc:h-full wwc:rounded-full wwc:bg-muted-foreground/50"
												style={{width: `${selected.planned}%`}}
											/>
										</div>
									</div>
								</div>

								{/* Milestones — fixture-backed; host hides via `hideMilestones`. */}
								{!hideMilestones && (
									<>
										<Separator />
										<div className="wwc:px-4 wwc:py-4">
											<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-base wwc:font-semibold">
												Milestones
												<span className="wwc:text-sm wwc:font-normal wwc:text-muted-foreground">
													{MILESTONES.length}
												</span>
											</span>
											<div className="wwc:mt-3 wwc:grid wwc:grid-cols-[1fr_auto_auto] wwc:items-center wwc:gap-x-6 wwc:gap-y-2.5">
												<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
													Milestone
												</span>
												<span className="wwc:text-right wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
													Actual
												</span>
												<span className="wwc:text-right wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
													Planned
												</span>
												{MILESTONES.map((m) => (
													<div key={m.id} className="wwc:contents">
														<span className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:text-sm wwc:font-medium">
															<span className={cn("wwc:size-2 wwc:rounded-full", m.dotClass)} />
															{m.label}
														</span>
														<span
															className={cn("wwc:text-right wwc:text-sm wwc:font-medium", milestoneToneClass(m.status))}
														>
															{m.actual}
														</span>
														<span className="wwc:text-right wwc:text-sm wwc:text-muted-foreground">{m.planned}</span>
													</div>
												))}
											</div>
										</div>
									</>
								)}

								<Separator />

								{/* Location path */}
								<div className="wwc:px-4 wwc:py-4">
									<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
										Location path
									</span>
									<p className="wwc:mt-1.5 wwc:break-words wwc:font-mono wwc:text-xs wwc:leading-relaxed wwc:text-foreground">
										{selectedPath}
									</p>
								</div>
							</TabsContent>

							{/* Floors — progress by floor. */}
							{!hideFloors && (
								<TabsContent value="floors" className="wwc:px-4 wwc:pt-4">
									<div className="wwc:flex wwc:flex-col wwc:gap-3">
										{FLOORS.map((f) => (
											<div key={f.code} className="wwc:flex wwc:flex-row wwc:items-center wwc:gap-3">
												<span className="wwc:w-6 wwc:shrink-0 wwc:text-sm wwc:font-medium wwc:text-muted-foreground">
													{f.code}
												</span>
												<div className="wwc:h-2 wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
													<div
														className={cn("wwc:h-full wwc:rounded-full", floorBarClass(f.status))}
														style={{width: `${f.value}%`}}
													/>
												</div>
												<span className="wwc:w-10 wwc:shrink-0 wwc:text-right wwc:text-sm wwc:font-semibold">
													{f.value}%
												</span>
											</div>
										))}
									</div>
								</TabsContent>
							)}

							{/* Evidence — evidence-chain scaffold. */}
							{!hideEvidence && (
								<TabsContent value="evidence" className="wwc:px-4 wwc:pt-4">
									<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-base wwc:font-semibold">
										<Link2 className="wwc:size-4 wwc:text-primary" />
										Evidence Chain
									</span>
									<Tabs value={evidenceTab} onValueChange={setEvidenceTab} className="wwc:mt-3">
										<TabsList className="wwc:w-full">
											{EVIDENCE_TABS.map((t) => (
												<TabsTrigger key={t.value} value={t.value} className="wwc:flex-1">
													{t.label}
												</TabsTrigger>
											))}
										</TabsList>
									</Tabs>
									<button
										type="button"
										className="wwc:mt-3 wwc:flex wwc:w-full wwc:flex-row wwc:items-center wwc:gap-3 wwc:rounded-lg wwc:border wwc:border-border wwc:px-3 wwc:py-2.5 wwc:text-left wwc:transition-colors wwc:hover:bg-accent"
									>
										<span className="wwc:size-2 wwc:shrink-0 wwc:rounded-full wwc:bg-success" />
										<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
											<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
												Latest capture
											</span>
											<span className="wwc:truncate wwc:text-sm wwc:font-medium">OpenSpace · 22 Aug</span>
										</span>
										<ChevronRight className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
									</button>
								</TabsContent>
							)}

							{/* Activities — coming soon. */}
							{!hideActivities && (
								<TabsContent
									value="activities"
									className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:px-4 wwc:py-16 wwc:text-center"
								>
									<span className="wwc:flex wwc:size-11 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted wwc:text-muted-foreground">
										<Clock className="wwc:size-5" />
									</span>
									<span className="wwc:text-sm wwc:font-medium">Coming soon</span>
									<span className="wwc:text-xs wwc:text-muted-foreground">Villa activities will appear here.</span>
								</TabsContent>
							)}
						</Tabs>
					</div>

					{/* Overlay scrollbar — floats over the content; shown while scrolling / on mouse-enter, fading after 1s. */}
					<div className="wwc:pointer-events-none wwc:absolute wwc:right-1 wwc:z-40" style={{top: 64, bottom: 8}}>
						<div
							className={cn(
								"wwc:absolute wwc:right-0 wwc:w-1.5 wwc:rounded-full wwc:bg-foreground/30 wwc:transition-opacity wwc:duration-300",
								detailScrollbar.visible ? "wwc:opacity-100" : "wwc:opacity-0",
							)}
							style={{top: detailScrollbar.top, height: detailScrollbar.height}}
						/>
					</div>
				</aside>
			)}

			{/* Blueprints fallback dialog — only used when the host doesn't supply `onOpenBlueprints`. */}
			{selected && (
				<Dialog open={blueprintsOpen} onOpenChange={setBlueprintsOpen}>
					<DialogContent className="wwc:max-w-2xl">
						<DialogHeader>
							<DialogTitle>Blueprints — {selected.name}</DialogTitle>
							<DialogDescription>
								{selected.meta}
								{captureId ? ` · capture ${captureId}` : ""}
								{rangeLabel ? ` · ${rangeLabel}` : ""}
							</DialogDescription>
						</DialogHeader>

						<div className="wwc:grid wwc:grid-cols-2 wwc:gap-3">
							{FLOORS.map((f) => (
								<div
									key={f.code}
									className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-border wwc:p-3"
								>
									<div className="wwc:flex wwc:items-center wwc:justify-between">
										<span className="wwc:text-sm wwc:font-medium">Level {f.code}</span>
										<Badge variant="secondary">{f.value}%</Badge>
									</div>
									<div className="wwc:flex wwc:h-24 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted wwc:text-xs wwc:text-muted-foreground">
										Sheet A-{f.code}-01
									</div>
								</div>
							))}
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setBlueprintsOpen(false)}>
								Close
							</Button>
							<Button
								onClick={() => {
									if (detailVilla) onOpenBlueprints?.(detailVilla);
									setBlueprintsOpen(false);
								}}
							>
								Open in viewer
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}

export default SitePanel;
