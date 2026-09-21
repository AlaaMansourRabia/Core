import type {BuildingFloor} from "@wakecap/core-ui/building-progress";

import {CanvasNavigator, type CanvasNavigatorNode} from "@wakecap/core-ui/canvas-navigator";
import {useFragmentViewer} from "@wakecap/core-ui/fragment-viewer";
import {cn} from "@wakecap/core-utils";
import {Calendar, ChevronDown, ChevronLeft, ChevronRight, Play} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {FloorProgressBar} from "./floor-list/floor-progress-bar";
import {FloorTabs} from "./floor-list/floor-tabs";
import {StatusBadge} from "./floor-list/status-badge";
import {StatusIcon} from "./floor-list/status-icon";
import type {FloorStatus, FloorTab} from "./floor-list/types";
import {clearHighlightedElements, highlightElements} from "./timeline/scene-painter";
import {VILLA_SCHEDULE} from "./timeline/villa-schedule";

// A trade/activity worked on a floor.
export interface Trade {
	id: string;
	name: string;
	value: number; // 0–100
	status: "done" | "active" | "pending";
}

export type {FloorStatus};

// A floor row is a BuildingFloor (id/label/value) plus the extra detail the inspector + row UI need.
// Keeping it a *superset* of BuildingFloor means this list stays a drop-in swap for <BuildingProgress>.
export type Floor = BuildingFloor & {
	subtitle: string;
	area: string;
	crew: number;
	updatedAgo: string;
	cam: string;
	trades: Trade[];
	/** Drives the status badge + timing line. */
	status: FloorStatus;
	/** Weeks until start (not-started) or weeks remaining (in-progress). */
	weeks: number;
	/** Completion week label, e.g. "W24" (complete floors). */
	completedWeek: string;
};

// The villa's storeys (top → bottom, mirroring the building elevation). Labels match the model's IFC
// IfcBuildingStorey names EXACTLY ("Ground Floor" / "First Floor" / "Second Floor" / "Roof") so the
// floor click name-matches the real storey and isolates the right elements (see openStoreyForFloor).
// Progress/trades are mock (no live feed).
const UE22_LEVELS: {level: string; subtitle: string}[] = [
	{level: "Roof", subtitle: "Roof / Mechanical"},
	{level: "Second Floor", subtitle: "Second Floor"},
	{level: "First Floor", subtitle: "First Floor"},
	{level: "Ground Floor", subtitle: "Ground Floor"},
];

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const TRADE_TEMPLATE: {id: string; name: string}[] = [
	{id: "framing", name: "Framing"},
	{id: "electrical", name: "Electrical rough-in"},
	{id: "plumbing", name: "Plumbing"},
	{id: "drywall", name: "Drywall"},
	{id: "paint", name: "Paint & finish"},
];

const clamp100 = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export const FLOORS: Floor[] = UE22_LEVELS.map(({level, subtitle}, index) => {
	const n = UE22_LEVELS.length;
	// Construction runs bottom-up, so the top floors read least complete and the ground floor is done.
	const value = clamp100(Math.round((index / (n - 1)) * 112) - 6);
	const status: FloorStatus = value <= 0 ? "not-started" : value >= 100 ? "complete" : "in-progress";
	const weeks =
		status === "not-started"
			? Math.round((n - index) * 0.4 * 10) / 10 // starts later the higher it is
			: Math.round(((100 - value) / 100) * 22 * 10) / 10; // more remaining the less complete
	const completedWeek = `W${23 + (n - index)}`;
	const trades: Trade[] = TRADE_TEMPLATE.map((trade, t) => {
		const v = clamp100(value + 18 - t * 22); // earlier trades further along
		const tradeStatus: Trade["status"] = v >= 100 ? "done" : v > 0 ? "active" : "pending";
		return {...trade, value: v, status: tradeStatus};
	});
	return {
		id: slugify(level),
		label: level,
		subtitle,
		value,
		area: `${540 - index * 6} m²`,
		crew: Math.max(3, 14 - index),
		updatedAgo: `${(index + 1) * 7}m ago`,
		cam: `CAM ${(index % 3) + 1}`,
		trades,
		status,
		weeks,
		completedWeek,
	};
});

export const getFloor = (id: string | null): Floor | undefined => FLOORS.find((floor) => floor.id === id);

// Map a site-model levelName (IFC storey name) → a floor, so a clicked part preselects its floor.
export const getFloorByLevel = (level: string | null | undefined): Floor | undefined =>
	level ? FLOORS.find((floor) => floor.label.toLowerCase() === level.trim().toLowerCase()) : undefined;

const clampPct = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

// The timing line under a floor's title: "Starting in N weeks" / "Completed WXX" / "N weeks to go".
function FloorTiming({floor}: {floor: Floor}) {
	if (floor.status === "not-started") {
		return (
			<>
				<span className="wwc:font-light wwc:text-[#9ca3af]">Starting in</span>
				<span className="wwc:font-semibold wwc:text-[#6b7280]">{floor.weeks} weeks</span>
			</>
		);
	}
	if (floor.status === "complete") {
		return (
			<>
				<span className="wwc:font-light wwc:text-[#9ca3af]">Completed</span>
				<span className="wwc:font-semibold wwc:text-[#6b7280]">{floor.completedWeek}</span>
			</>
		);
	}
	return (
		<>
			<span className="wwc:font-semibold wwc:text-[#6b7280]">{floor.weeks} weeks</span>
			<span className="wwc:font-light wwc:text-[#9ca3af]">to go</span>
		</>
	);
}

/**
 * The selected floor, expanded (Figma "Capture Admin Redesign", node 1842:5632): status icon + title +
 * status badge, a timing line with a percentage, and a progress bar along the bottom edge. Blue-tinted
 * + bordered so it stands out from the compact rows around it.
 */
function FloorRowExpanded({floor, onSelect}: {floor: Floor; onSelect: () => void}) {
	const pct = clampPct(floor.value);
	return (
		<button
			type="button"
			aria-pressed
			onClick={onSelect}
			className="wwc:relative wwc:flex wwc:w-full wwc:flex-col wwc:gap-1 wwc:overflow-hidden wwc:border wwc:border-[#60a5fa] wwc:bg-[rgba(239,246,255,0.9)] wwc:px-2 wwc:pb-2.5 wwc:pt-2 wwc:text-left wwc:focus-visible:outline-none"
		>
			{/* title + status badge */}
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
				<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
					<StatusIcon status={floor.status} />
					<span className="wwc:truncate wwc:text-[13px] wwc:font-semibold wwc:text-[#111827]">{floor.label}</span>
				</span>
				<StatusBadge status={floor.status} />
			</div>

			{/* timing + percentage */}
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:text-[12px]">
				<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-[3px] wwc:truncate">
					<FloorTiming floor={floor} />
				</span>
				<span className="wwc:shrink-0 wwc:text-[13px] wwc:font-semibold wwc:tabular-nums wwc:text-[#111827]">
					{floor.status === "not-started" ? "-" : `${pct}%`}
				</span>
			</div>

			<FloorProgressBar pct={pct} showTrack={floor.status === "complete"} />
		</button>
	);
}

/**
 * A non-selected floor, compact (Figma node 1842:5622 rows): status icon + title on the left, its
 * percentage (or "-" when not started) on the right. Clicking it selects the floor.
 */
function FloorRowCompact({floor, onSelect}: {floor: Floor; onSelect: () => void}) {
	const pct = clampPct(floor.value);
	const valueColor = floor.status === "in-progress" ? "wwc:text-[#111827]" : "wwc:text-[#9ca3af]";
	return (
		<button
			type="button"
			onClick={onSelect}
			className="wwc:relative wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:border-[#f3f4f6] wwc:bg-[#f9fafb] wwc:px-2 wwc:pb-2.5 wwc:pt-2 wwc:text-left wwc:transition-colors wwc:hover:bg-[#f3f4f6] wwc:focus-visible:outline-none"
		>
			<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
				<StatusIcon status={floor.status} />
				<span className="wwc:truncate wwc:text-[13px] wwc:font-medium wwc:text-[#111827]">{floor.label}</span>
			</span>
			<span className={cn("wwc:shrink-0 wwc:text-[13px] wwc:font-medium wwc:tabular-nums", valueColor)}>
				{floor.status === "not-started" ? "-" : `${pct}%`}
			</span>
		</button>
	);
}

// The frosted-glass card shell shared by the Schedule + LBS panel views.
const PANEL_CARD =
	"wwc:rounded wwc:bg-[rgba(255,255,255,0.8)] wwc:p-3 wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg";

/**
 * The bordered floor list (Figma node 1842:5622): a single frosted card whose rows are separated by
 * hairlines. The selected floor expands to the detailed row; every other floor stays a compact row.
 */
function FloorList({
	floors,
	selectedId,
	onSelect,
	className,
}: {
	floors: Floor[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	className?: string;
}) {
	return (
		// The rows scroll INSIDE this box (the inner div), so the box + its drop shadow stay put and are
		// never clipped by a scroll ancestor. The box shrinks to its content but caps at the available
		// height (min-h-0), at which point the inner list scrolls.
		<div
			className={cn(
				"wwc:flex wwc:min-h-0 wwc:w-full wwc:flex-col wwc:overflow-hidden wwc:rounded wwc:border wwc:border-[#f3f4f6] wwc:bg-[#f9fafb] wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg",
				className,
			)}
		>
			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:[&>button:last-child]:border-b-0">
				{floors.map((floor) =>
					floor.id === selectedId ? (
						<FloorRowExpanded key={floor.id} floor={floor} onSelect={() => onSelect(floor.id)} />
					) : (
						<FloorRowCompact key={floor.id} floor={floor} onSelect={() => onSelect(floor.id)} />
					),
				)}
			</div>
		</div>
	);
}

// A real construction-schedule task (from public/schedule.json) — only the fields the panel needs.
interface ScheduleTaskLite {
	id: string;
	name: string;
	/** Links the task to a schedule object (→ its IFC GUIDs) so a click can highlight it on the model. */
	objectId: string;
	storey: string;
	startDate: string;
	endDate: string;
	duration: number;
	startDay: number;
	tradeColor: string;
	tradeLabel: string;
}

// Floors listed top → bottom (mirroring the Floors tab / building elevation), site-wide work last.
const ACTIVITY_FLOOR_ORDER = [...UE22_LEVELS.map((l) => l.level), "Site"];
const MMDD = (iso: string) => iso.slice(5); // "2026-01-01" -> "01-01"

// Colour a clicked schedule element glows in on the 3D model.
const MODEL_HIGHLIGHT_COLOR = "#60a5fa";

// The FragmentViewer context when the schedule is rendered inside one (the house view); null otherwise
// (e.g. isolated stories), so a row click highlights on the model only when a viewer is present.
function useOptionalFragmentViewer(): ReturnType<typeof useFragmentViewer> | null {
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useFragmentViewer();
	} catch {
		return null;
	}
}

/**
 * Construction schedule view: the real schedule (public/schedule.json), grouped into a floor-based
 * hierarchy. Each floor is a collapsible header (its date range + span); the activities beneath carry
 * their trade-colour swatch, name and duration. Floors with work active today start expanded.
 *
 * Pass `only` (a storey name = a floor's label) to filter the schedule to just that one floor — used by
 * the right-side Floor Inspector for the selected floor; omit it for the full left-panel schedule. The
 * filtered floor also starts expanded.
 */
export function ActivitiesTable({
	only,
	objectId,
	title,
	highlightTaskId,
	onSelectObject,
}: {
	only?: string;
	/** Filter the list to a single schedule object's tasks (task.objectId === this). */
	objectId?: string;
	title?: string;
	highlightTaskId?: string | null;
	onSelectObject?: (objectId: string) => void;
} = {}) {
	// The real villa schedule is bundled (no fetch) — the single source, adapted from the P6 export.
	const [tasks] = useState<ScheduleTaskLite[] | null>(() => VILLA_SCHEDULE.tasks);
	// objectId → heuristic model linkage (storey + discipline categories), so a clicked task can highlight
	// its elements even though P6 carries no IFC GUIDs.
	const [objLink] = useState<Map<string, {storeyName: string | null; categories: RegExp[]}>>(
		() => new Map(VILLA_SCHEDULE.objects.map((o) => [o.id, {storeyName: o.storeyName, categories: o.categories}])),
	);
	const error: string | null = null;
	const [collapsed, setCollapsed] = useState<Set<string> | null>(null);
	// The clicked task (highlighted in the list + on the model).
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

	// The viewer (if any) + the localIds of the current model highlight, so the next click can clear it.
	const viewer = useOptionalFragmentViewer();
	const viewerRef = useRef(viewer);
	viewerRef.current = viewer;
	const highlightRef = useRef<number[] | null>(null);

	// Clear any lingering model highlight when the schedule unmounts (e.g. the inspector closes).
	useEffect(
		() => () => {
			const components = viewerRef.current?.api.viewport()?.components;
			if (components) void clearHighlightedElements(components, highlightRef.current);
		},
		[],
	);

	// When an object is selected, highlight its active task — expanding its (possibly collapsed) group and
	// scrolling the row into view so the active task is always shown.
	const highlightRowRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (!highlightTaskId || !tasks) return;
		setSelectedTaskId(highlightTaskId);
		const task = tasks.find((t) => t.id === highlightTaskId);
		if (task) {
			setCollapsed((prev) => {
				if (!prev || !prev.has(task.storey)) return prev; // already open (or not yet initialised)
				const next = new Set(prev);
				next.delete(task.storey);
				return next;
			});
		}
	}, [highlightTaskId, tasks]);
	useEffect(() => {
		highlightRowRef.current?.scrollIntoView({block: "nearest"});
	}, [selectedTaskId]);

	// Click a task → highlight it in the list and light up its elements on the 3D model (if a viewer is
	// mounted and the model is ready). Re-highlighting clears the previous one.
	const selectTask = (task: ScheduleTaskLite) => {
		setSelectedTaskId(task.id);
		onSelectObject?.(task.objectId);
		const v = viewerRef.current;
		const components = v?.api.viewport()?.components;
		if (!components || v?.state.status !== "ready") return;
		const link = objLink.get(task.objectId);
		if (!link) return;
		void highlightElements(components, link.storeyName, link.categories, MODEL_HIGHLIGHT_COLOR, highlightRef.current).then(
			(ids) => {
				highlightRef.current = ids;
			},
		);
	};

	const today = new Date().toISOString().slice(0, 10);

	const groups = useMemo(() => {
		if (!tasks) return [];
		const source = objectId ? tasks.filter((t) => t.objectId === objectId) : tasks;
		const byFloor = new Map<string, ScheduleTaskLite[]>();
		for (const t of source) {
			const bucket = byFloor.get(t.storey);
			if (bucket) bucket.push(t);
			else byFloor.set(t.storey, [t]);
		}
		return ACTIVITY_FLOOR_ORDER.filter((s) => byFloor.has(s) && (!only || s === only)).map((storey) => {
			const list = [...byFloor.get(storey)!].sort((a, b) => a.startDay - b.startDay);
			const span = Math.max(...list.map((t) => t.startDay + t.duration)) - Math.min(...list.map((t) => t.startDay));
			return {
				storey,
				tasks: list,
				startDate: list[0].startDate,
				endDate: list.reduce((m, t) => (t.endDate > m ? t.endDate : m), list[0].endDate),
				span,
			};
		});
	}, [tasks, only, objectId]);

	// Once loaded, collapse every floor except the ones with work in progress today.
	useEffect(() => {
		if (!tasks || collapsed) return;
		const activeFloors = new Set(tasks.filter((t) => t.startDate <= today && today < t.endDate).map((t) => t.storey));
		// When filtered to one floor (the inspector), keep that floor expanded.
		if (only) activeFloors.add(only);
		setCollapsed(new Set([...new Set(tasks.map((t) => t.storey))].filter((s) => !activeFloors.has(s))));
	}, [tasks, collapsed, today, only]);

	const label = (s: string) => (s === "Site" ? "Site-wide" : s);
	const toggle = (s: string) =>
		setCollapsed((prev) => {
			const next = new Set(prev ?? []);
			if (next.has(s)) next.delete(s);
			else next.add(s);
			return next;
		});

	if (error) return <div className={PANEL_CARD}>
		<p className="wwc:text-[12px] wwc:text-[#dc2626]">{error}</p>
	</div>;
	if (!tasks) return <div className={PANEL_CARD}>
		<p className="wwc:text-[12px] wwc:text-[#9ca3af]">Loading schedule…</p>
	</div>;

	// A 3-column table: Task Name (flexes + truncates) · Dates · Duration. The Dates/Duration columns
	// are fixed-width and left-aligned so the header, floor headers, and task rows all line up.
	const DATE_COL = "wwc:w-[84px] wwc:shrink-0 wwc:text-left wwc:tabular-nums";
	const DUR_COL = "wwc:w-16 wwc:shrink-0 wwc:text-left wwc:tabular-nums";

	return (
		<div className={cn(PANEL_CARD, "wwc:flex wwc:flex-col wwc:overflow-hidden wwc:p-0")}>
			{/* Optional title bar — a white header inside the card, above the task list. */}
			{title && (
				<div className="wwc:border-b wwc:border-[#f3f4f6] wwc:px-2 wwc:py-2.5 wwc:text-[13px] wwc:font-semibold wwc:text-[#111827]">
					{title}
				</div>
			)}
			{/* column header */}
			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:border-b wwc:border-[#f3f4f6] wwc:px-2 wwc:py-2 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-[#9ca3af]">
				<span className="wwc:min-w-0 wwc:flex-1">Task Name</span>
				<span className={DATE_COL}>Dates</span>
				<span className={DUR_COL}>Duration</span>
			</div>
			<div className="wwc:max-h-[60vh] wwc:overflow-y-auto">
				{groups.map((g) => {
					const open = !(collapsed?.has(g.storey) ?? false);
					return (
						<div key={g.storey}>
							{/* floor group header — the OPEN floor is highlighted #E5E7EB. */}
							<button
								type="button"
								onClick={() => toggle(g.storey)}
								className={cn(
									"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:border-b wwc:border-[#f3f4f6] wwc:px-2 wwc:py-1.5 wwc:text-left wwc:transition-colors",
									open ? "wwc:bg-[#e5e7eb]" : "wwc:hover:bg-[#f9fafb]",
								)}
							>
								<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-1.5">
									{open ? (
										<ChevronDown className="wwc:size-3.5 wwc:shrink-0 wwc:text-[#111827]" />
									) : (
										<ChevronRight className="wwc:size-3.5 wwc:shrink-0 wwc:text-[#111827]" />
									)}
									<span className="wwc:min-w-0 wwc:truncate wwc:text-[12px] wwc:font-bold wwc:text-[#111827]">
										{label(g.storey)}
									</span>
								</span>
								<span className={cn(DATE_COL, "wwc:text-[10px] wwc:text-[#9ca3af]")}>
									{MMDD(g.startDate)}→{MMDD(g.endDate)}
								</span>
								<span className={cn(DUR_COL, "wwc:text-[12px] wwc:font-semibold wwc:text-[#111827]")}>{g.span}d</span>
							</button>
							{/* task rows — each clickable (highlights on the model) and carrying its own dates. */}
							{open &&
								g.tasks.map((t) => {
									const selected = t.id === selectedTaskId;
									return (
										<button
											key={t.id}
											ref={selected ? highlightRowRef : undefined}
											type="button"
											onClick={() => selectTask(t)}
											title={`${t.name} · ${t.tradeLabel} · ${MMDD(t.startDate)} → ${MMDD(t.endDate)}`}
											className={cn(
												"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:border-b wwc:border-[#f3f4f6] wwc:px-2 wwc:py-1.5 wwc:text-left wwc:transition-colors wwc:focus-visible:outline-none",
												selected ? "wwc:bg-[rgba(96,165,250,0.16)]" : "wwc:hover:bg-[#f9fafb]",
											)}
										>
											<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2 wwc:pl-1.5">
												<span
													className="wwc:size-2.5 wwc:shrink-0 wwc:rounded-[3px]"
													style={{backgroundColor: t.tradeColor}}
												/>
												<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-[12px] wwc:text-[#111827]">{t.name}</span>
											</span>
											<span className={cn(DATE_COL, "wwc:text-[10px] wwc:text-[#9ca3af]")}>
												{MMDD(t.startDate)}→{MMDD(t.endDate)}
											</span>
											<span className={cn(DUR_COL, "wwc:text-[11px] wwc:text-[#6b7280]")}>{t.duration}d</span>
										</button>
									);
								})}
						</div>
					);
				})}
			</div>
		</div>
	);
}

/**
 * LBS view (placeholder wiring): the location breakdown structure as a drill-down tree, reusing the
 * library CanvasNavigator. Selecting a floor node drives the same selection as the floor cards.
 */
function LbsView({selectedId, onSelect}: {selectedId: string | null; onSelect: (id: string) => void}) {
	const nodes: CanvasNavigatorNode[] = [
		{id: "ue22", label: "UE22 Tower", children: FLOORS.map((floor) => ({id: floor.id, label: floor.label}))},
	];
	return (
		<CanvasNavigator
			nodes={nodes}
			value={selectedId ?? undefined}
			onSelect={onSelect}
			searchable
			searchPlaceholder="Search locations…"
		/>
	);
}

// Program-week numbering shared with the app (blueprint-navigator: W109 = the week of 2026-06-12), so a
// schedule day maps to a "W###" label consistently across the app.
const DAY_MS = 24 * 60 * 60 * 1000;
const PROGRAM_WEEK_EPOCH = Date.UTC(2026, 5, 12);
const dayMs = (iso: string, day = 0) => Date.parse(`${iso}T00:00:00Z`) + day * DAY_MS;
const weekLabel = (ms: number) => `W${109 + Math.floor((ms - PROGRAM_WEEK_EPOCH) / (7 * DAY_MS))}`;

/**
 * Current-week bar (Figma node 1842:5908): a calendar + the week label, and prev / play / next controls.
 * It defaults to the week containing today (clamped to the schedule) and the chevrons step weeks. Play
 * calls `onPlay` with that week's schedule day, which starts the 4D timeline from there.
 */
function ScheduleWeekBar({onPlay}: {onPlay?: (day: number) => void}) {
	const meta = VILLA_SCHEDULE.meta;
	const [weekIndex, setWeekIndex] = useState(0);
	const initialized = useRef(false);

	const maxWeek = Math.max(0, Math.floor((meta.totalDays - 1) / 7));

	// Default to the week containing today, clamped to the schedule (once meta is in).
	useEffect(() => {
		if (!meta || initialized.current) return;
		initialized.current = true;
		const todayDay = Math.floor((dayMs(new Date().toISOString().slice(0, 10)) - dayMs(meta.projectStart)) / DAY_MS);
		setWeekIndex(Math.max(0, Math.min(maxWeek, Math.floor(todayDay / 7))));
	}, [meta, maxWeek]);

	const weekStartDay = weekIndex * 7;
	const label = meta ? weekLabel(dayMs(meta.projectStart, weekStartDay)) : "—";

	return (
		<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:rounded wwc:border wwc:border-[rgba(255,255,255,0.5)] wwc:bg-[rgba(255,255,255,0.8)] wwc:p-3 wwc:text-[13px] wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg">
			<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1">
				<Calendar className="wwc:size-3.5 wwc:shrink-0 wwc:text-[#111827] wwc:opacity-50" />
				<span className="wwc:font-semibold wwc:text-[#374151]">{label}</span>
			</div>
			<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:justify-between wwc:px-2">
				<button
					type="button"
					aria-label="Previous week"
					disabled={weekIndex <= 0}
					onClick={() => setWeekIndex((w) => Math.max(0, w - 1))}
					className="wwc:text-[#111827] wwc:opacity-50 wwc:transition-opacity wwc:hover:opacity-100 wwc:disabled:opacity-20 wwc:focus-visible:outline-none"
				>
					<ChevronLeft className="wwc:size-4" />
				</button>
				<button
					type="button"
					aria-label={`Play 4D timeline from ${label}`}
					onClick={() => onPlay?.(weekStartDay)}
					className="wwc:text-[#111827] wwc:opacity-60 wwc:transition-opacity wwc:hover:opacity-100 wwc:focus-visible:outline-none"
				>
					<Play className="wwc:size-4 wwc:fill-current" />
				</button>
				<button
					type="button"
					aria-label="Next week"
					disabled={weekIndex >= maxWeek}
					onClick={() => setWeekIndex((w) => Math.min(maxWeek, w + 1))}
					className="wwc:text-[#111827] wwc:opacity-50 wwc:transition-opacity wwc:hover:opacity-100 wwc:disabled:opacity-20 wwc:focus-visible:outline-none"
				>
					<ChevronRight className="wwc:size-4" />
				</button>
			</div>
		</div>
	);
}

/**
 * Left "Floor" panel (Figma "Capture Admin Redesign", node 1842:5601): a tab row (Floor / Schedule /
 * LBS) pinned above the active view. The tab bar is a shrink-0 sibling ABOVE the scroll area, so the
 * floor list (or any inner scroll) never moves it — the tabs stay fixed. The panel is width-fit to its
 * widest child; the tab bar is full-width, so the panel is never narrower than the tabs but can grow.
 * Presentational: selection is owned by the parent so the same choice drives the 3D storey highlight
 * and Floor Inspector. Data-compatible with `@wakecap/core-ui/building-progress`.
 */
export function FloorPanel({
	floors = FLOORS,
	selectedId,
	onSelect,
	onPlayTimeline,
	onSelectObject,
	onTabChange,
	scheduleActiveTaskId,
	className,
}: {
	floors?: Floor[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	/** Start the 4D timeline from a schedule day — wired to the Schedule tab's week-bar Play button. */
	onPlayTimeline?: (day: number) => void;
	/** A schedule row was clicked — select that object (highlight on the model + open the object panel). */
	onSelectObject?: (objectId: string) => void;
	/** The active tab — reported on mount and on change, so the parent can react (e.g. hide the inspector). */
	onTabChange?: (tab: FloorTab) => void;
	/** The selected object's active task — the Schedule tab expands + highlights it (e.g. after a model pick). */
	scheduleActiveTaskId?: string | null;
	className?: string;
}) {
	const [tab, setTab] = useState<FloorTab>("floors");
	useEffect(() => {
		onTabChange?.(tab);
	}, [tab, onTabChange]);
	return (
		<div className={cn("wwc:flex wwc:h-full wwc:min-h-0 wwc:w-fit wwc:max-w-full wwc:flex-col wwc:gap-1", className)}>
			{/* Fixed tabs: a shrink-0 sibling above the views, so list/other scrolling never shifts them. */}
			<FloorTabs className="wwc:w-full wwc:shrink-0" active={tab} onChange={setTab} />
			{/* Each view manages its own scrolling so its card shadow isn't clipped by a scroll ancestor. */}
			{tab === "floors" ? (
				<FloorList floors={floors} selectedId={selectedId} onSelect={onSelect} />
			) : tab === "schedule" ? (
				<>
					{/* Current-week bar, pinned below the tabs and above the activity list; Play starts 4D. */}
					<ScheduleWeekBar onPlay={onPlayTimeline} />
					<div className="wwc:min-h-0 wwc:overflow-y-auto">
						<ActivitiesTable onSelectObject={onSelectObject} highlightTaskId={scheduleActiveTaskId} />
					</div>
				</>
			) : (
				<div className="wwc:min-h-0 wwc:overflow-y-auto">
					<LbsView selectedId={selectedId} onSelect={onSelect} />
				</div>
			)}
		</div>
	);
}
