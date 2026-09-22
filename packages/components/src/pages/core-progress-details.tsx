// Progress Details — Variant I (Compact Work Items). A self-contained progress-details workspace:
// a three-bar header (app nav → period context → search/filter), a WBS Navigator sidebar, and a main
// panel of compact two-line work-item rows. Mock data only. The pencil file was a layout reference only —
// styling comes from Core components + semantic tokens.
//
// FULLSCREEN: the ProgressDetails component intentionally ships WITHOUT a fullscreen button.
// Fullscreen is a concern of the host/spec page (ProgressDetailsPage), which owns the toggle and
// the exit affordance.
import {
	ArrowLeft,
	ArrowUpDown,
	ChevronDown,
	Download,
	History,
	Lock,
	PanelLeft,
	Search,
	SlidersHorizontal,
	Upload,
} from "lucide-react";
import {Fragment, useLayoutEffect, useMemo, useRef, useState} from "react";

import {Badge} from "../badge";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../breadcrumb";
import {Button} from "../button";
import {ButtonGroup} from "../button-group";
import {CanvasNavigator, type CanvasNavigatorNode} from "../canvas-navigator";
import {Card} from "../card";
import {Input} from "../input";
import {OperationsDrawer, type OperationRow} from "../operations-drawer";
import {ProgressListItem, type ProgressListItemVariant} from "../progress-list-item";
import {ViewTabBar, type ViewTabItem} from "../view-tab-bar";
import type {WeekSelectorWeek} from "../week-selector";

// ── Domain model ──────────────────────────────────────────────────────────────────────────────────

// Shared display shapes for progress list rows (consumed by the ProgressListItem component).
type ListMetric = {label: string; value: string; tone?: "neutral" | "negative" | "positive"};
type ListBadge = {label: string; tone: "deviation" | "within"};

// The WBS tree: zones → categories → divisions. Divisions are the leaves that carry work items.
type Division = {id: string; label: string};
type Category = {id: string; label: string; divisions: Division[]};
type Zone = {id: string; label: string; categories: Category[]};

const ZONES: Zone[] = [
	{
		id: "zone-1",
		label: "Zone 1 - Block A",
		categories: [
			{
				id: "structural",
				label: "Structural",
				divisions: [
					{id: "div-31", label: "Div 31 - Earthwork"},
					{id: "div-32", label: "Div 32 - Exterior"},
					{id: "div-33", label: "Div 33 - Utilities"},
				],
			},
			{id: "mep", label: "MEP", divisions: [{id: "mep-hvac", label: "Div 23 - HVAC"}]},
			{id: "finishes", label: "Finishes", divisions: [{id: "fin-paint", label: "Div 09 - Finishes"}]},
		],
	},
	{id: "zone-2", label: "Zone 2 - Block B", categories: []},
	{id: "zone-3", label: "Zone 3 - Block C", categories: []},
	{id: "zone-4", label: "Zone 4 - Block D", categories: []},
];

// Map the WBS tree into the CanvasNavigator's node shape (branches carry `children`, divisions are
// leaves). This variant is icon-free — rows show only the chevron + label.
const NAV_NODES: CanvasNavigatorNode[] = ZONES.map((zone) => ({
	id: zone.id,
	label: zone.label,
	children: zone.categories.map((category) => ({
		id: category.id,
		label: category.label,
		children: category.divisions.map((division) => ({id: division.id, label: division.label})),
	})),
}));

// The tasks (work items) under each division — the level that owns a progress bar + schedule badge.
type TaskSeed = {
	code: string;
	description: string;
	badge: ListBadge;
	bac: string;
	ev: string;
	pv: string;
	sv: string;
	svNegative: boolean;
	sch: string;
	progress: number;
	tools: number;
};
const TASKS_BY_DIVISION: Record<string, TaskSeed[]> = {
	"div-31": [
		{
			code: "RM-C-1A-B01-01-T-111",
			description: "Earth work - Backfilling For Foundation",
			badge: {label: "+21.3% Schedule ahead", tone: "deviation"},
			bac: "181.6K",
			ev: "165.8K",
			pv: "181.6K",
			sv: "-15.8K",
			svNegative: true,
			sch: "100%",
			progress: 79,
			tools: 4,
		},
		{
			code: "RM-C-1A-B01-01-T-122",
			description: "Earth work - Excavation For PC",
			badge: {label: "Within 5%", tone: "within"},
			bac: "3.5K",
			ev: "3.4K",
			pv: "3.5K",
			sv: "-176.9",
			svNegative: true,
			sch: "100%",
			progress: 95,
			tools: 4,
		},
		{
			code: "RM-C-1A-B01-01-T-133",
			description: "Anti-termite Under PC Concrete",
			badge: {label: "Within 5%", tone: "within"},
			bac: "3K",
			ev: "2.8K",
			pv: "3K",
			sv: "-148.3",
			svNegative: true,
			sch: "100%",
			progress: 95,
			tools: 4,
		},
	],
};

// Object + operation name pools — the two levels generated beneath each task.
const OBJECT_NAMES = ["Precast Panel", "Foundation Block", "Steel Column", "Concrete Slab"];
const OPERATION_NAMES = ["Fabrication", "Delivery", "Installation", "Casting", "Curing", "Inspection"];

// Approval summary shown in the period-context bar — a colored status dot + label + count per state.
const APPROVAL_STATS = [
	{label: "Approved", value: "0", dot: "wwc:bg-emerald-500"},
	{label: "Pending", value: "0", dot: "wwc:bg-amber-500"},
	{label: "Rejected", value: "0", dot: "wwc:bg-destructive"},
];

// Collection periods, one per week — feeds the WeekSelector (date-range label + pager + week tabs).
const WEEKS: WeekSelectorWeek[] = [
	{value: "W111", label: "111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", label: "112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", label: "113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", label: "114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", label: "115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

// The Collection / Comparison view switcher shown in the segmented header toolbar.
type ModeTab = "collection" | "comparison";
const MODE_TABS: readonly ViewTabItem<ModeTab>[] = [
	{id: "collection", label: "Collection"},
	{id: "comparison", label: "Comparison"},
];

// ── Navigation index ────────────────────────────────────────────────────────────────────────────
// A flat, parent-linked index over the whole WBS tree so the content pane can drill any level
// (root → zone → category → division → task → object → operation) and reconstruct the breadcrumb. Each
// node also carries the display fields consumed by ProgressListItem.

const ROOT_ID = "root";
type NodeKind = "root" | "zone" | "category" | "division" | "task" | "object" | "operation";

type WbsNode = {
	id: string;
	kind: NodeKind;
	parentId: string | null;
	childIds: string[];
	crumb: string;
	// ProgressListItem display fields:
	title: string;
	subtitle?: string;
	badge?: ListBadge;
	metrics?: ListMetric[];
	progress?: number;
	tools?: number;
};

// A node kind maps to the ProgressListItem variant it renders as. Operations are not rows (they live in
// the Operations Drawer), so they never reach this.
function variantOf(kind: NodeKind): ProgressListItemVariant {
	return kind === "task" ? "task" : kind === "object" ? "object" : "generic";
}

// Deterministic pseudo-random derived from a string — stable across renders (no Math.random).
function hashInt(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

// A mock EV rollup + WBS code for a generic (zone/category/division) node, keyed off a seed.
function genericMeta(seed: number): {code: string; metrics: ListMetric[]; tools: number} {
	const at = (mult: number, mod: number) => (seed * mult) % mod;
	const bac = 90 + at(37, 450);
	const ev = bac * (0.3 + at(13, 45) / 100);
	const pv = bac * (0.28 + at(19, 47) / 100);
	const sv = ev - pv;
	const m = (n: number) => `${n.toFixed(1)}M`;
	return {
		code: `MRM-RS-${String((seed % 89) + 10)}-BL-${(seed % 9) + 1}`,
		metrics: [
			{label: "BAC", value: m(bac)},
			{label: "EV", value: m(ev)},
			{label: "PV", value: m(pv)},
			{label: "SV", value: `${sv < 0 ? "-" : ""}${m(Math.abs(sv))}`, tone: sv < 0 ? "negative" : "positive"},
		],
		tools: 1200 + at(911, 90000),
	};
}

const NODE_INDEX: Map<string, WbsNode> = (() => {
	const map = new Map<string, WbsNode>();
	let seed = 1;

	map.set(ROOT_ID, {
		id: ROOT_ID,
		kind: "root",
		parentId: null,
		childIds: ZONES.map((z) => z.id),
		crumb: "All zones",
		title: "All zones",
	});

	for (const zone of ZONES) {
		const zm = genericMeta(seed++);
		map.set(zone.id, {
			id: zone.id,
			kind: "zone",
			parentId: ROOT_ID,
			childIds: zone.categories.map((c) => c.id),
			crumb: zone.label,
			title: zone.label,
			subtitle: zm.code,
			metrics: zm.metrics,
			tools: zm.tools,
		});
		for (const category of zone.categories) {
			const cm = genericMeta(seed++);
			map.set(category.id, {
				id: category.id,
				kind: "category",
				parentId: zone.id,
				childIds: category.divisions.map((d) => d.id),
				crumb: category.label,
				title: category.label,
				subtitle: cm.code,
				metrics: cm.metrics,
				tools: cm.tools,
			});
			for (const division of category.divisions) {
				const dm = genericMeta(seed++);
				const taskIds: string[] = [];
				map.set(division.id, {
					id: division.id,
					kind: "division",
					parentId: category.id,
					childIds: taskIds,
					crumb: division.label.replace(/^Div /, "Division "),
					title: division.label,
					subtitle: dm.code,
					metrics: dm.metrics,
					tools: dm.tools,
				});

				// Tasks → objects → operations (two children at each generated level).
				(TASKS_BY_DIVISION[division.id] ?? []).forEach((task, ti) => {
					const taskId = `${division.id}::t${ti + 1}`;
					taskIds.push(taskId);
					const objectIds: string[] = [];
					map.set(taskId, {
						id: taskId,
						kind: "task",
						parentId: division.id,
						childIds: objectIds,
						crumb: task.code,
						// The description is the label; the code is the secondary line beneath it.
						title: task.description,
						subtitle: task.code,
						badge: task.badge,
						metrics: [
							{label: "BAC", value: task.bac},
							{label: "EV", value: task.ev},
							{label: "PV", value: task.pv},
							{label: "SV", value: task.sv, tone: task.svNegative ? "negative" : "positive"},
							{label: "Sch", value: task.sch},
						],
						progress: task.progress,
						tools: task.tools,
					});

					for (let oi = 0; oi < 2; oi++) {
						const objectId = `${taskId}::o${oi + 1}`;
						objectIds.push(objectId);
						const opIds: string[] = [];
						const objCode = `${task.code}-O${oi + 1}`;
						const objName = `${OBJECT_NAMES[(ti + oi) % OBJECT_NAMES.length]} ${oi + 1}`;
						const objBac = 40 + (hashInt(objectId) % 160);
						const objEv = objBac * (0.5 + (hashInt(`${objectId}ev`) % 50) / 100);
						map.set(objectId, {
							id: objectId,
							kind: "object",
							parentId: taskId,
							childIds: opIds,
							crumb: objName,
							// The object name is the label; its code is the secondary line beneath (like the generic row).
							title: objName,
							subtitle: objCode,
							metrics: [
								{label: "BAC", value: `${objBac.toFixed(1)}K`},
								{label: "EV", value: `${objEv.toFixed(1)}K`},
							],
							progress: 45 + (hashInt(objectId) % 55),
							tools: 2 + (hashInt(objectId) % 8),
						});

						for (let pi = 0; pi < 2; pi++) {
							const opId = `${objectId}::p${pi + 1}`;
							opIds.push(opId);
							const opCode = `${objCode}-OP${pi + 1}`;
							map.set(opId, {
								id: opId,
								kind: "operation",
								parentId: objectId,
								childIds: [],
								crumb: opCode,
								title: opCode,
								subtitle: OPERATION_NAMES[(oi + pi) % OPERATION_NAMES.length],
								badge:
									hashInt(opId) % 2 === 0
										? {label: "Within 5%", tone: "within"}
										: {label: "+8.4% Schedule ahead", tone: "deviation"},
								progress: 45 + (hashInt(opId) % 55),
							});
						}
					}
				});
			}
		}
	}
	return map;
})();

// The synthetic top-level node — the fallback current position (always present in the index).
const ROOT_NODE = NODE_INDEX.get(ROOT_ID) as WbsNode;

// The chain root → … → node, used to render the breadcrumb.
function ancestorsOf(id: string): WbsNode[] {
	const chain: WbsNode[] = [];
	let node = NODE_INDEX.get(id);
	while (node) {
		chain.unshift(node);
		node = node.parentId ? NODE_INDEX.get(node.parentId) : undefined;
	}
	return chain;
}

// The breadcrumb label for a node.
const fullLabel = (node: WbsNode) => node.crumb;

// The breadcrumb trail for the current position, in the "With Ellipsis" variant AND responsive: it renders
// the full trail while it fits the available width, and collapses the middle levels into the ellipsis
// dropdown only once it would overflow. An off-layout probe measures the full trail's natural (single-line)
// width against the container, re-checked on every container resize — so it adapts to the actual space.
function BreadcrumbTrail({ancestors, onNavigate}: {ancestors: WbsNode[]; onNavigate: (id: string) => void}) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const probeRef = useRef<HTMLDivElement>(null);
	const [collapsed, setCollapsed] = useState(false);
	const trailKey = ancestors.map((n) => n.id).join("/");

	useLayoutEffect(() => {
		const wrap = wrapRef.current;
		const probe = probeRef.current;
		if (!wrap || !probe) return;
		const check = () => {
			// Need at least first + one middle + last to have anything to collapse.
			if (ancestors.length <= 2) {
				setCollapsed(false);
				return;
			}
			setCollapsed(probe.scrollWidth > wrap.clientWidth);
		};
		check();
		const observer = new ResizeObserver(check);
		observer.observe(wrap);
		return () => observer.disconnect();
	}, [trailKey, ancestors.length]);

	const last = ancestors[ancestors.length - 1];
	const leading = ancestors.slice(0, -1); // every level except the current one

	const crumbLink = (node: WbsNode) => (
		<BreadcrumbLink
			href="#"
			onClick={(e) => {
				e.preventDefault();
				onNavigate(node.id);
			}}
		>
			{fullLabel(node)}
		</BreadcrumbLink>
	);

	const renderList = (collapse: boolean) => {
		const inlineLeading = collapse ? leading.slice(0, 1) : leading;
		const hidden = collapse ? leading.slice(1) : [];
		return (
			<BreadcrumbList className="wwc:flex-nowrap">
				{inlineLeading.map((node) => (
					<Fragment key={node.id}>
						<BreadcrumbItem>{crumbLink(node)}</BreadcrumbItem>
						<BreadcrumbSeparator />
					</Fragment>
				))}
				{collapse && (
					<>
						<BreadcrumbItem>
							<BreadcrumbEllipsis
								items={hidden.map((node) => ({label: fullLabel(node), onSelect: () => onNavigate(node.id)}))}
							/>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
					</>
				)}
				<BreadcrumbItem className="wwc:min-w-0">
					<BreadcrumbPage className="wwc:truncate">{fullLabel(last)}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		);
	};

	return (
		<div ref={wrapRef} className="wwc:relative wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden">
			{/* Off-layout probe: the full trail on one line, measured only to decide whether it fits. */}
			<div
				ref={probeRef}
				aria-hidden="true"
				className="wwc:pointer-events-none wwc:invisible wwc:absolute wwc:left-0 wwc:top-0 wwc:whitespace-nowrap"
			>
				<Breadcrumb>{renderList(false)}</Breadcrumb>
			</div>
			<Breadcrumb>{renderList(collapsed)}</Breadcrumb>
		</div>
	);
}

// ── Workspace ─────────────────────────────────────────────────────────────────────────────────────
//
// NOTE: this component has NO fullscreen button — fullscreen is owned by the host page. It renders the
// same at any size and simply fills its container.

/**
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the ProgressDetails template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function ProgressDetails() {
	const [tab, setTab] = useState<ModeTab>("collection");
	const [week, setWeek] = useState("W113");
	// The current position in the WBS hierarchy — drives the content list + breadcrumb. Start at a division
	// (the mock's default view); the breadcrumb / back button climb up to the top and you can drill again.
	const [currentId, setCurrentId] = useState("div-31");
	// The navigator's collapse control hides the whole sidebar; a toggle in the filter bar brings it back.
	const [sidebarOpen, setSidebarOpen] = useState(true);
	// Clicking an object opens the Operations Drawer for it (operations are reviewed there, not as rows).
	const [drawerObjectId, setDrawerObjectId] = useState<string | null>(null);
	// Edited operation progress values, keyed by operation id (the drawer's inputs are controlled).
	const [opProgress, setOpProgress] = useState<Record<string, string>>({});

	const current = NODE_INDEX.get(currentId) ?? ROOT_NODE;
	const ancestors = useMemo(() => ancestorsOf(current.id), [current.id]);
	// The content list is always the current node's children, each rendered as a ProgressListItem.
	const children = current.childIds.map((id) => NODE_INDEX.get(id)).filter((n): n is WbsNode => n !== undefined);
	const periodCode = `${week}-2026`;

	// The object whose operations the drawer edits, and its operation rows.
	const drawerObject = drawerObjectId ? NODE_INDEX.get(drawerObjectId) : undefined;
	const drawerRows: OperationRow[] = drawerObject
		? drawerObject.childIds
				.map((id) => NODE_INDEX.get(id))
				.filter((n): n is WbsNode => n !== undefined)
				.map((op) => ({
					name: op.subtitle ?? op.title,
					code: op.title,
					wt: `${25 + (hashInt(`${op.id}wt`) % 50)}%`,
					prev: `${(op.progress ?? 0) > 60 ? 100 : 0}%`,
					bac: `${(10 + (hashInt(`${op.id}b`) % 40)).toFixed(1)}K`,
					ev: `${(hashInt(`${op.id}e`) % 30).toFixed(1)}K`,
					progress: opProgress[op.id] ?? `${op.progress ?? 0}%`,
					onProgressChange: (v) => setOpProgress((p) => ({...p, [op.id]: v})),
				}))
		: [];

	// The sibling objects the drawer was opened from (the parent task's objects) — the header pager cycles
	// the drawer through them, wrapping around at either end.
	const drawerSiblings = drawerObject
		? (NODE_INDEX.get(drawerObject.parentId ?? "")?.childIds ?? [])
				.map((id) => NODE_INDEX.get(id))
				.filter((n): n is WbsNode => n !== undefined)
		: [];
	const drawerIndex = drawerSiblings.findIndex((n) => n.id === drawerObjectId);
	const cycleObject = (step: 1 | -1) => {
		if (drawerSiblings.length === 0) return;
		const next = (drawerIndex + step + drawerSiblings.length) % drawerSiblings.length;
		setDrawerObjectId(drawerSiblings[next].id);
	};

	return (
		<div className="wwc:relative wwc:flex wwc:h-full wwc:w-full wwc:flex-col wwc:overflow-hidden wwc:bg-background">
			{/* ── Header Bar 1 (N0KDa layout) — tab switcher (left), date-range + period pager (right). ─── */}
			<div className="wwc:flex wwc:min-h-14 wwc:shrink-0 wwc:items-center wwc:overflow-x-auto wwc:border-b wwc:border-border wwc:bg-background wwc:px-4">
				<ViewTabBar
					variant="segmented"
					tabs={MODE_TABS}
					activeTab={tab}
					onTabChange={setTab}
					weekSelector={{weeks: WEEKS, value: week, onValueChange: setWeek, visibleCount: 5}}
				/>
			</div>

			{/* ── Header Bar 2 (N0KDa layout) — period context (left), icon actions + Import + Close Period
			    (right). Export/Recent Imports are now icon-only buttons; Import moves down from bar 1. ─────── */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:gap-4 wwc:overflow-x-auto wwc:border-b wwc:border-border wwc:bg-background wwc:px-4">
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-3">
					<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">{periodCode}</span>
					<Badge variant="secondary">Open</Badge>
					<span className="wwc:text-xs wwc:text-muted-foreground">Cut-off: day 5</span>
					{/* Approval summary — a colored status dot + label + count per state, divider-separated. */}
				</div>
				<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:justify-center wwc:gap-3">
					{APPROVAL_STATS.map((stat, i) => (
						<Fragment key={stat.label}>
							{i > 0 && <span className="wwc:h-4 wwc:w-px wwc:bg-border" aria-hidden="true" />}
							<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs">
								<span className={`wwc:size-1.5 wwc:rounded-full ${stat.dot}`} aria-hidden="true" />
								<span className="wwc:text-muted-foreground">{stat.label}</span>
								<span className="wwc:font-bold wwc:text-foreground">{stat.value}</span>
							</span>
						</Fragment>
					))}
				</div>

				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					<Button type="button" variant="outline" icon size="sm" aria-label="Export">
						<Download className="wwc:size-4" />
					</Button>
					<Button type="button" variant="outline" icon size="sm" aria-label="Recent imports">
						<History className="wwc:size-4" />
					</Button>
					<Button type="button" variant="outline" size="sm" className="wwc:gap-1.5">
						<Upload className="wwc:size-4" />
						Import
					</Button>
					{/* Close Period — split button: primary action + divider + chevron section. */}
					<ButtonGroup className="wwc:overflow-hidden">
						<Button type="button" size="sm" className="wwc:gap-1.5 wwc:rounded-none">
							<Lock className="wwc:size-4" />
							Close Period
						</Button>
						<span className="wwc:w-px wwc:bg-primary-foreground/20" aria-hidden="true" />
						<Button type="button" icon size="sm" aria-label="More close-period actions" className="wwc:rounded-none">
							<ChevronDown className="wwc:size-4" />
						</Button>
					</ButtonGroup>
				</div>
			</div>

			{/* ── Body — sidebar + main panel ───────────────────────────────────────────────────────── */}
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1">
				{/* WBS Navigator sidebar — the CanvasNavigator IS the sidebar (its own header carries the search
				    field + the collapse control, inline, exactly like the standalone component). We keep `size`
				    pinned to "expanded" and intercept its collapse control (onSizeChange → "collapsed") to hide the
				    entire sidebar rather than shrink the navigator to a header. */}
				{sidebarOpen && (
					<aside className="wwc:flex wwc:w-64 wwc:shrink-0 wwc:flex-col wwc:border-r wwc:border-border wwc:bg-background">
						<CanvasNavigator
							nodes={NAV_NODES}
							value={current.id}
							// Selecting any node in the tree navigates the content pane to that level.
							onSelect={(id) => setCurrentId(id)}
							size="expanded"
							onSizeChange={(next) => {
								// The header's collapse button asks for "collapsed" — repurpose it to hide the sidebar.
								if (next === "collapsed") setSidebarOpen(false);
							}}
							expandable={false}
							// The collapse control hides the whole sidebar, so it uses the panel icon rather than a chevron.
							collapseIcon={<PanelLeft className="wwc:size-4" />}
							searchable
							searchPlaceholder="Jump to code..."
							defaultExpandedIds={["zone-1", "structural"]}
							// Override the navigator's fixed expanded width/height so it fills the w-64 sidebar instead of
							// overflowing it, and strip its floating-panel chrome (border/rounding/shadow/background). The
							// pt-1 nudges the 44px search header down so its bottom border aligns with the 48px content toolbar.
							className="wwc:h-full wwc:min-h-0 wwc:w-full wwc:max-w-full wwc:flex-1 wwc:rounded-none wwc:border-0 wwc:bg-transparent wwc:pt-1 wwc:shadow-none"
						/>
					</aside>
				)}

				{/* Main content panel */}
				<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:bg-muted/40">
					{/* ── Condensed content header (n8u5b) — back + breadcrumb (left), search + Sort + filter
					    (right). Merges the former filter bar and breadcrumb row into a single bar. ────────────── */}
					<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-background wwc:px-4">
						<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-3">
							{/* Reopen the WBS Navigator sidebar after it's been hidden from the navigator's collapse control. */}
							{!sidebarOpen && (
								<Button
									type="button"
									variant="ghost"
									icon
									size="sm"
									aria-label="Show WBS Navigator"
									onClick={() => setSidebarOpen(true)}
								>
									<PanelLeft className="wwc:size-4" />
								</Button>
							)}
							{/* Back climbs one level; each crumb jumps to that level. */}
							<Button
								type="button"
								variant="outline"
								icon
								size="sm"
								aria-label="Go up one level"
								disabled={!current.parentId}
								onClick={() => current.parentId && setCurrentId(current.parentId)}
							>
								<ArrowLeft className="wwc:size-4" />
							</Button>
							<BreadcrumbTrail ancestors={ancestors} onNavigate={setCurrentId} />
						</div>
						<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
							<div className="wwc:relative wwc:w-56">
								<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:size-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
								<Input placeholder="Search" className="wwc:h-8 wwc:pl-8 wwc:text-sm" />
							</div>
							<Button type="button" variant="outline" size="sm" className="wwc:gap-1.5">
								<ArrowUpDown className="wwc:size-4" />
								Sort
							</Button>
							<Button type="button" variant="outline" icon size="sm" aria-label="Filters">
								<SlidersHorizontal className="wwc:size-4" />
							</Button>
						</div>
					</div>

					{/* Padded content area */}
					<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:p-4">
						{/* Content list: the current node's children, each rendered by the shared ProgressListItem
						    (generic / task / object). Grouping rows drill in; an object opens the Operations Drawer for
						    its operations (operations are no longer list rows). */}
						{children.length > 0 ? (
							<Card className="wwc:overflow-hidden wwc:bg-background wwc:p-0">
								{children.map((child, i) => {
									const onOpen =
										child.kind === "object"
											? () => setDrawerObjectId(child.id)
											: child.childIds.length > 0
												? () => setCurrentId(child.id)
												: undefined;
									return (
										<div key={child.id} className={i > 0 ? "wwc:border-t wwc:border-border" : ""}>
											<ProgressListItem
												variant={variantOf(child.kind)}
												title={child.title}
												subtitle={child.subtitle}
												badge={child.badge}
												metrics={child.metrics}
												progress={child.progress}
												tools={child.tools}
												onOpen={onOpen}
											/>
										</div>
									);
								})}
							</Card>
						) : (
							<div className="wwc:flex wwc:h-40 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:border-dashed wwc:border-border wwc:text-sm wwc:text-muted-foreground">
								Nothing to show under {current.crumb} for {periodCode}.
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Operations Drawer — opened by clicking an object. It slides in over the workspace and edits that
			    object's operations; the backdrop or its close/save dismisses it. */}
			{drawerObject && (
				<div className="wwc:absolute wwc:inset-0 wwc:z-30 wwc:flex wwc:justify-end">
					<button
						type="button"
						aria-label="Close operations drawer"
						className="wwc:absolute wwc:inset-0 wwc:cursor-default wwc:bg-foreground/10"
						onClick={() => setDrawerObjectId(null)}
					/>
					<OperationsDrawer
						className="wwc:relative wwc:z-10 wwc:rounded-none"
						title={drawerObject.subtitle ?? drawerObject.title}
						wbs={ancestorsOf(drawerObject.id)
							.slice(1)
							.map((n) => n.crumb)
							.join(" / ")}
						progress={drawerObject.progress ?? 0}
						page={drawerSiblings.length > 1 ? {current: drawerIndex + 1, total: drawerSiblings.length} : undefined}
						onPrev={() => cycleObject(-1)}
						onNext={() => cycleObject(1)}
						rows={drawerRows}
						onClose={() => setDrawerObjectId(null)}
						onDiscard={() => setDrawerObjectId(null)}
						onSave={() => setDrawerObjectId(null)}
					/>
				</div>
			)}
		</div>
	);
}
