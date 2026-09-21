import {cn} from "@core/core-utils";
import {Calendar, Check, ChevronLeft, ChevronRight, FileText, GanttChart, Plane, Play, X} from "lucide-react";
/**
 * ProgressSheet — a self-contained, CONTROLLED Core widget for the bottom
 * toolbar (Progress Overview + Timeline + draggable week scrubber) and the
 * slide-up Reports sheet (milestone-progression waffle hero + plan-vs-reality
 * milestone-timing band).
 *
 * Extracted verbatim from `pages/capture-ui-enhanced.tsx` (component body). The
 * host (`CaptureUiEnhanced`) stays the single owner of the values that cross to
 * other widgets — `capture` (selected week), `reportsOpen`, and `reportScrollY`
 * — because BuildingViewer reads `reportScrollY` for its parallax and every
 * widget reads `reportsOpen` as `chromeHidden`/`chromeFade`. ProgressSheet reads
 * those three as props and reports changes via semantic callbacks; it owns only
 * its own local UI state (timeline open/close, the timeline hover menu, the date
 * picker, the measured waffle grid columns, the report scroll element, and the
 * WeekTimeline's internal scrub/flow/snap state).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTERACTIONS THIS WIDGET OWNS  (control → prop / callback / local state)
 * ─────────────────────────────────────────────────────────────────────────────
 * • Progress Overview button        → onReportsOpenChange(!reportsOpen)   (reads `reportsOpen`)
 * • Reports close (X)               → onReportsOpenChange(false)
 * • Overscroll-to-dismiss           → onReportsOpenChange(false) once the up-pull
 *                                      accumulator passes 280px (local `overscrollRef`)
 * • Reports body scroll             → onReportScroll(scrollTop)  (drives BuildingViewer's map parallax)
 * • On reports open/close           → onReportScroll(0) + local scroll/overscroll reset
 * • Timeline button                 → toggles local `timelineOpen` + closes local `timelineMenuOpen`
 * • Timeline hover                  → toggles local `timelineMenuOpen`
 * • Timeline menu · "Timeline" item → local `timelineOpen = true`, close menu
 * • Timeline menu · "Drone playback"→ inert (disabled, "Coming soon")
 * • Date button                     → toggles local `datePickerOpen` (Popover)
 * • Calendar day pick               → onCaptureChange(week.value) after clamping the
 *                                      picked date to the timeline range (from props) + close picker
 * • WeekTimeline prev/next chevrons → onCaptureChange(value)   (reads `capture`)
 * • WeekTimeline drag / edge-flow   → onCaptureChange(value) (live-selects the week under the handle)
 * • §1 waffle & §3 heatmap          → non-interactive (pure derivation from `selectedWeek`,
 *                                      `progressionData`, and the measured `gridCols`)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ANIMATIONS THIS WIDGET OWNS
 * ─────────────────────────────────────────────────────────────────────────────
 * • Bottom toolbar chrome fade      → `chromeFade` prop (transition-opacity duration-500 + opacity-0/pointer-events-none while reportsOpen)
 * • Toolbar pill hover              → transition-colors on the Progress Overview / Timeline buttons
 * • WeekTimeline tick strip         → transform 300ms ease (none while dragging)
 * • WeekTimeline handle             → left 200ms ease (none while dragging)
 * • WeekTimeline edge auto-scroll   → rAF, 2 → 26 weeks/s accelerating with hold time
 * • WeekTimeline tick label         → transition-colors (active / month-start / muted)
 * • Reports overlay (dark + blur)   → bg-black/60 backdrop-blur-md, opacity 500ms ease-out on open
 * • Reports close button            → opacity 500ms
 * • Reports slide layer             → transition-transform duration-[550ms] ease-out, translate-y-full ↔ translate-y-0
 * • §1 current-month waffle         → ring-2 ring-orange-400/80 on the current month grid
 *
 * NOTE: Opening the sheet only fades/parallaxes the map — this widget NEVER calls
 * `runMapTransition` or moves the camera. The host owns that machine.
 */
import {
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
	type WheelEvent as ReactWheelEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {Button} from "./button";
import {Calendar as DatePickerCalendar} from "./calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {PROGRESS_LEGEND_ITEMS, styleForVilla, type Villa as SiteVilla} from "./site-image-viewer";

/* ------------------------------------------------------------------ *
 * Shared timeline type — mirrors the host's `TimelineWeek` (the host does not
 * export it). One tick per weekly reality-capture run.
 * ------------------------------------------------------------------ */
export interface TimelineWeek {
	value: string;
	/** Week number shown on the tick (unless it starts a month). */
	num: number;
	start: Date;
	end: Date;
	/** True when this week begins a new month — the tick shows the month name instead of the number. */
	monthStart: boolean;
	monthLabel: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

/**
 * Milestone Progression — every square uses the real milestone-ramp colour for its % (the SPA legend the
 * map + legend already use), for both the actual and the planned rows.
 */
const milestoneColor = (pct: number) =>
	styleForVilla({linkedLbsItemId: 1, approvedProgressPercent: pct, plannedProgressPercent: pct}, "progress").fill;
/** Synthesised month-over-month step (percentage points) — history ramps down, forecast ramps up from now. */
const MONTH_STEP = 7;

/* ------------------------------------------------------------------ *
 * §3 report section — plan-vs-reality milestone-timing heatmap.
 * ------------------------------------------------------------------ */

/** §3 milestone-timing heatmap — one row per milestone, two bands (plan over actual) on a month axis. */
const MT_DATA_DATE = 17;
const MT_AXIS = Array.from({length: 40}, (_, i) => {
	const d = new Date(2025, 2 + i, 1);
	return `${MONTHS[d.getMonth()]}-${String(d.getFullYear()).slice(2)}`;
});
const MT_ROWS: {id: string; plan: [number, number]; actual: [number, number]}[] = [
	{id: "M35", plan: [3, 8], actual: [4, 10]},
	{id: "M50", plan: [8, 13], actual: [10, 16]},
	{id: "M65", plan: [14, 19], actual: [16, 22]},
	{id: "M80", plan: [20, 25], actual: [24, 30]},
	{id: "M95", plan: [26, 31], actual: [30, 36]},
	{id: "M100", plan: [31, 36], actual: [34, 39]},
];

function ReportSwatch({color, label}: {color: string; label: string}) {
	return (
		<span className="wwc:flex wwc:items-center wwc:gap-1.5">
			<span className="wwc:size-2.5 wwc:rounded-[2px]" style={{backgroundColor: color}} />
			{label}
		</span>
	);
}

function ReportSectionHead({
	num,
	eyebrow,
	heading,
	subtitle,
	aside,
}: {
	num: string;
	eyebrow: string;
	heading: string;
	subtitle: string;
	aside?: ReactNode;
}) {
	return (
		<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-8">
			<div className="wwc:min-w-0">
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-[11px] wwc:font-bold wwc:uppercase wwc:tracking-[0.18em]">
					<span className="wwc:text-orange-400">{num}</span>
					<span className="wwc:text-white/50">{eyebrow}</span>
				</div>
				<h3 className="wwc:mt-1.5 wwc:text-3xl wwc:font-semibold wwc:tracking-tight wwc:text-white">{heading}</h3>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-sm wwc:leading-relaxed wwc:text-white/55">{subtitle}</p>
			</div>
			{aside ? <div className="wwc:hidden wwc:shrink-0 wwc:lg:block">{aside}</div> : null}
		</div>
	);
}

function MilestoneTimingBand({range, kind}: {range: [number, number]; kind: "plan" | "actual"}) {
	const [s, e] = range;
	// Actual milestone data isn't captured yet → the actual band renders in missing-data grey; plan stays slate.
	const base = kind === "plan" ? [96, 143, 214] : [120, 120, 128];
	return (
		<div className="wwc:grid wwc:gap-px" style={{gridTemplateColumns: "repeat(40, minmax(0, 1fr))"}}>
			{Array.from({length: 40}, (_, i) => {
				const inWin = i >= s && i <= e;
				const t = e > s ? (i - s) / (e - s) : 0.5;
				const op = 0.32 + 0.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
				return (
					<div
						key={i}
						className="wwc:h-3 wwc:rounded-[1px]"
						style={{
							backgroundColor: inWin
								? `rgba(${base[0]},${base[1]},${base[2]},${op.toFixed(2)})`
								: "rgba(255,255,255,0.03)",
						}}
					/>
				);
			})}
		</div>
	);
}

/** §3 · Schedule — milestone-timing two-band heatmap. */
function MilestoneTimingSection() {
	return (
		<section>
			<ReportSectionHead
				num="§3"
				eyebrow="Schedule · Milestone timing"
				heading="Plan against reality, milestone by milestone."
				subtitle="For each milestone (M35→M100) the planned timing band sits above the actual+forecast band on one month axis. The horizontal gap between the two bands is the slip."
			/>
			<div className="wwc:mt-8">
				<div className="wwc:text-sm wwc:font-semibold wwc:text-white">Milestone timing · plan vs actual</div>
				<div className="wwc:mt-0.5 wwc:text-xs wwc:text-white/45">
					upper band = plan · lower band = actual + forecast · shade = villas hitting that milestone that month
				</div>
				<div className="wwc:mt-3 wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-4 wwc:gap-y-1 wwc:text-[11px] wwc:text-white/55">
					<ReportSwatch color="rgba(96,143,214,0.8)" label="Plan (slate)" />
					<ReportSwatch color="rgba(120,120,128,0.8)" label="Actual — no data yet" />
					<span className="wwc:flex wwc:items-center wwc:gap-1.5">
						<span className="wwc:h-3 wwc:w-0.5 wwc:bg-orange-400" />
						Data date · Aug-26
					</span>
				</div>
				<div className="wwc:relative wwc:mt-5">
					<div className="wwc:flex wwc:flex-col wwc:gap-2">
						{MT_ROWS.map((row) => (
							<div key={row.id} className="wwc:flex wwc:items-center wwc:gap-3">
								<span className="wwc:w-9 wwc:shrink-0 wwc:text-right wwc:text-[11px] wwc:text-white/50">{row.id}</span>
								<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-px">
									<MilestoneTimingBand range={row.plan} kind="plan" />
									<MilestoneTimingBand range={row.actual} kind="actual" />
								</div>
							</div>
						))}
					</div>
					<div
						className="wwc:absolute wwc:inset-y-0 wwc:border-l wwc:border-dashed wwc:border-orange-400"
						style={{left: `calc(3rem + (100% - 3rem) * ${(MT_DATA_DATE + 0.5) / 40})`}}
					/>
				</div>
				<div className="wwc:mt-1.5 wwc:flex wwc:pl-12 wwc:text-[9px] wwc:text-white/35">
					{MT_AXIS.map((l, i) => (
						<span key={i} className="wwc:min-w-0 wwc:flex-1 wwc:text-center">
							{i % 3 === 0 ? l : ""}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}

/** Report section(s) below the milestone hero — only the plan-vs-reality milestone timing is shown. */
function ReportSections() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-14 wwc:pb-14">
			<MilestoneTimingSection />
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * WeekTimeline — draggable week scrubber.
 * ------------------------------------------------------------------ */

/**
 * Draggable week timeline — a white selection handle over a strip of tick lines. Drag the handle to scrub;
 * hold it near an end and the strip flows through the dates, accelerating the longer it's held. Releasing
 * snaps the handle to the nearest week. Month-boundary weeks show the month name instead of the number.
 */
function WeekTimeline({weeks, value, onChange}: {weeks: TimelineWeek[]; value: string; onChange: (v: string) => void}) {
	const SPACING = 34; // px between tick centres
	const VISIBLE = 7; // ticks across the track (narrower scrubber)
	const TRACK_W = SPACING * VISIBLE;
	const EDGE = SPACING * 1.4; // how close to an end triggers auto-scroll
	const total = weeks.length;
	const maxOffset = Math.max(0, total - VISIBLE);
	const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
	const valueIndex = Math.max(
		0,
		weeks.findIndex((w) => w.value === value),
	);

	const [offset, setOffset] = useState(() => clamp(valueIndex - Math.floor(VISIBLE / 2), 0, maxOffset));
	const [dragging, setDragging] = useState(false);
	const [handleX, setHandleX] = useState(0);
	const trackRef = useRef<HTMLDivElement>(null);
	const handleXRef = useRef(0);

	// Handle position (track coords) and the week currently under it.
	const handlePos = dragging ? handleX : (valueIndex - offset) * SPACING + SPACING / 2;
	const activeIndex = clamp(Math.round(handlePos / SPACING - 0.5 + offset), 0, total - 1);

	// Keep the selected week visible when it changes outside a drag (chevrons / external set).
	useEffect(() => {
		if (dragging) return;
		setOffset((o) => {
			if (valueIndex < o) return clamp(valueIndex, 0, maxOffset);
			if (valueIndex > o + VISIBLE - 1) return clamp(valueIndex - VISIBLE + 1, 0, maxOffset);
			return o;
		});
	}, [valueIndex, dragging, maxOffset]);

	// Live-select the week under the handle as it moves or as the strip auto-scrolls.
	useEffect(() => {
		if (!dragging) return;
		const w = weeks[activeIndex];
		if (w && w.value !== value) onChange(w.value);
	}, [activeIndex, dragging, weeks, value, onChange]);

	// Edge auto-scroll — flows the strip while the handle is held near an end, accelerating over time.
	useEffect(() => {
		if (!dragging) return;
		let raf = 0;
		let last = performance.now();
		let edgeHold = 0;
		const frame = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			const x = handleXRef.current;
			const dir = x < EDGE ? -1 : x > TRACK_W - EDGE ? 1 : 0;
			if (dir !== 0) {
				edgeHold += dt;
				const speed = Math.min(2 + edgeHold * edgeHold * 6, 26); // weeks/sec, accelerates with hold time
				setOffset((o) => clamp(o + dir * speed * dt, 0, maxOffset));
			} else {
				edgeHold = 0;
			}
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(raf);
	}, [dragging, maxOffset, EDGE, TRACK_W]);

	const pointerX = (clientX: number) => {
		const rect = trackRef.current?.getBoundingClientRect();
		return rect ? clamp(clientX - rect.left, 0, TRACK_W) : 0;
	};
	const onPointerDown = (e: ReactPointerEvent) => {
		e.preventDefault();
		const x = pointerX(e.clientX);
		handleXRef.current = x;
		setHandleX(x);
		setDragging(true);
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {
			/* not all environments support pointer capture */
		}
	};
	const onPointerMove = (e: ReactPointerEvent) => {
		if (!dragging) return;
		const x = pointerX(e.clientX);
		handleXRef.current = x;
		setHandleX(x);
	};
	const onPointerUp = (e: ReactPointerEvent) => {
		if (!dragging) return;
		setDragging(false);
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			/* ignore */
		}
	};
	const step = (delta: number) => onChange(weeks[clamp(valueIndex + delta, 0, total - 1)].value);

	const chevron =
		"wwc:flex wwc:size-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-background wwc:hover:text-foreground wwc:disabled:opacity-40 wwc:disabled:hover:bg-transparent";
	const fade = "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)";

	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-lg wwc:bg-muted wwc:px-1 wwc:py-0.5">
			<button
				type="button"
				aria-label="Previous week"
				onClick={() => step(-1)}
				disabled={valueIndex === 0}
				className={chevron}
			>
				<ChevronLeft className="wwc:size-4" />
			</button>
			<div
				ref={trackRef}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				className={cn(
					"wwc:relative wwc:touch-none wwc:select-none",
					dragging ? "wwc:cursor-grabbing" : "wwc:cursor-grab",
				)}
				style={{width: TRACK_W, height: 46}}
			>
				{/* Tick strip — clipped to the track and faded at both ends. */}
				<div className="wwc:absolute wwc:inset-0 wwc:overflow-hidden" style={{WebkitMaskImage: fade, maskImage: fade}}>
					<div
						className="wwc:absolute wwc:inset-0"
						style={{
							transform: `translateX(${-offset * SPACING}px)`,
							transition: dragging ? "none" : "transform 300ms ease",
						}}
					>
						{weeks.map((w, i) => {
							const active = i === activeIndex;
							return (
								<div
									key={w.value}
									className="wwc:absolute wwc:top-0 wwc:flex wwc:flex-col wwc:items-center"
									style={{left: i * SPACING + SPACING / 2, transform: "translateX(-50%)"}}
								>
									<span className="wwc:mt-2 wwc:h-3 wwc:w-px wwc:rounded-full wwc:bg-muted-foreground/40" />
									<span
										className={cn(
											"wwc:mt-3.5 wwc:text-[11px] wwc:leading-none wwc:tabular-nums wwc:transition-colors",
											active
												? "wwc:font-bold wwc:text-foreground"
												: w.monthStart
													? "wwc:font-semibold wwc:text-foreground"
													: "wwc:text-muted-foreground",
										)}
									>
										{w.monthStart ? w.monthLabel : w.num}
									</span>
								</div>
							);
						})}
					</div>
				</div>
				{/* White selection handle. */}
				<div
					className="wwc:pointer-events-none wwc:absolute wwc:top-1 wwc:h-7 wwc:w-2.5 wwc:-translate-x-1/2 wwc:rounded-full wwc:bg-white wwc:ring-1 wwc:ring-black/5"
					style={{
						left: handlePos,
						transition: dragging ? "none" : "left 200ms ease",
						boxShadow: "0 1px 4px rgba(0,0,0,0.45)",
					}}
				/>
			</div>
			<button
				type="button"
				aria-label="Next week"
				onClick={() => step(1)}
				disabled={valueIndex === total - 1}
				className={chevron}
			>
				<ChevronRight className="wwc:size-4" />
			</button>
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * ProgressSheet
 * ------------------------------------------------------------------ */

export type ProgressSheetProps = {
	// ---- timeline (host-owned selection) ----
	capture: string;
	timeline: TimelineWeek[];
	selectedWeek: TimelineWeek;
	rangeLabel: string;
	/** Calendar clamp range. */
	firstWeek: TimelineWeek;
	lastWeek: TimelineWeek;

	// ---- reports ----
	reportsOpen: boolean;
	showOnlyProgressionReport?: boolean;
	chromeFade: string;

	// ---- §1 hero data seam ----
	allVillas: SiteVilla[];
	progressionData?: {actualPercent: (number | null)[]; plannedPercent: (number | null)[]}[];

	// ================= CALLBACKS OUT =================
	/** WeekTimeline drag/step + date picker → host owns `capture`. */
	onCaptureChange: (value: string) => void;
	/** Progress Overview toggle / close X / overscroll dismiss → host owns `reportsOpen`. */
	onReportsOpenChange: (open: boolean) => void;
	/** Reports body scroll → drives BuildingViewer map parallax (host owns `reportScrollY`). */
	onReportScroll: (scrollTop: number) => void;
};

export function ProgressSheet({
	capture,
	timeline,
	selectedWeek,
	rangeLabel,
	firstWeek,
	lastWeek,
	reportsOpen,
	showOnlyProgressionReport,
	chromeFade,
	allVillas,
	progressionData,
	onCaptureChange,
	onReportsOpenChange,
	onReportScroll,
}: ProgressSheetProps) {
	// The bottom toolbar's "Timeline" button toggles the week scrubber (shown above the toolbar); hovering it
	// reveals an upward dropdown (Timeline / Drone playback).
	const [timelineOpen, setTimelineOpen] = useState(false);
	const [timelineMenuOpen, setTimelineMenuOpen] = useState(false);
	const [datePickerOpen, setDatePickerOpen] = useState(false);

	// Reports layout (at rest = scroll 0): grid hero 80% · 5% gap · report peek 15%. Scrolling moves the whole
	// page together — the map translates up 1:1 (host, via onReportScroll) so it scrolls away.
	const reportsScrollRef = useRef<HTMLDivElement>(null);
	// Overscroll-to-dismiss: pulling up past the very top accumulates; once past the threshold, close Reports.
	const overscrollRef = useRef(0);
	const onReportsWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
		const el = reportsScrollRef.current;
		if (!el) return;
		if (el.scrollTop <= 0 && e.deltaY < 0) {
			overscrollRef.current += -e.deltaY;
			if (overscrollRef.current > 280) {
				overscrollRef.current = 0;
				onReportsOpenChange(false);
			}
		} else {
			overscrollRef.current = 0;
		}
	};

	// Milestone Progression: size each month card's grid so all villas fill it. Measured from the hero.
	const gridRef = useRef<HTMLDivElement>(null);
	const [gridCols, setGridCols] = useState(20);
	useEffect(() => {
		const el = gridRef.current;
		if (!el) return;
		const measure = () => {
			const w = el.clientWidth;
			if (w > 0) {
				// Columns from WIDTH only → a fixed ~11px square. The waffle height then grows with the villa
				// count instead of squeezing every square into a fixed-height card (which overflowed at 733).
				const cardW = w / 6.4; // 6 month cards ≈ equal width (incl. gaps + divider)
				setGridCols(Math.max(6, Math.round(cardW / 11)));
			}
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	// Six monthly snapshots (4 history incl. current · 2 forecast). Each villa's month colour is synthesised
	// from its current progress ± MONTH_STEP per month; actual = blue, planned = purple (darker = further on).
	const progression = useMemo(() => {
		const cur = selectedWeek.start;
		// Real per-villa % (from `progressionData`) coloured by the same milestone ramp; `null` → muted grey.
		const missingFill = styleForVilla(
			{linkedLbsItemId: 1, approvedProgressPercent: null, plannedProgressPercent: null},
			"progress",
		).fill;
		const colorFor = (pct: number | null) => (pct == null ? missingFill : milestoneColor(pct));
		return Array.from({length: 6}, (_, idx) => {
			const o = idx - 3; // -3..+2, 0 = current month
			const d = new Date(cur.getFullYear(), cur.getMonth() + o, 1);
			const month = progressionData?.[idx];
			return {
				key: o,
				label: MONTHS[d.getMonth()].toUpperCase(),
				year: `'${String(d.getFullYear()).slice(2)}`,
				isCurrent: o === 0,
				isForecast: o > 0,
				actual: month
					? month.actualPercent.map(colorFor)
					: allVillas.map((v) => milestoneColor((v.approvedProgressPercent ?? 0) + o * MONTH_STEP)),
				planned: month
					? month.plannedPercent.map(colorFor)
					: allVillas.map((v) => milestoneColor((v.plannedProgressPercent ?? 0) + o * MONTH_STEP)),
			};
		});
	}, [selectedWeek, progressionData, allVillas]);

	// Rendered progression (memoised — 12 grids × 733 squares). Two rows (actual over planned), each row is
	// history · divider · forecast. No panels/boxes — bare squares + light labels over the blurred dark map.
	const progressionView = useMemo(() => {
		const gridStyle = {gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`};
		// Actual data exists up to the current month (coloured); the actual FORECAST months (after current) have
		// no data yet, so those squares render as missing-data grey. The planned row keeps its colours throughout.
		const MISSING = styleForVilla(
			{linkedLbsItemId: 1, approvedProgressPercent: null, plannedProgressPercent: null},
			"progress",
		).fill;
		const card = (m: (typeof progression)[number], kind: "actual" | "planned") => (
			<div key={m.key} className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<div className="wwc:mb-1.5 wwc:flex wwc:shrink-0 wwc:items-baseline wwc:justify-between">
					<span
						className={cn(
							"wwc:text-[11px] wwc:font-bold wwc:tracking-wide",
							m.isCurrent ? "wwc:text-orange-300" : "wwc:text-white/80",
						)}
					>
						{m.label}
					</span>
					<span className="wwc:text-[10px] wwc:font-medium wwc:text-white/40">{m.year}</span>
				</div>
				{/* The orange selection ring wraps only the waffle grid — not the month/year header above it. */}
				<div
					className={cn(
						"wwc:grid wwc:content-start wwc:gap-px",
						m.isCurrent && "wwc:-m-1 wwc:rounded-md wwc:p-1 wwc:ring-2 wwc:ring-orange-400/80",
					)}
					style={gridStyle}
				>
					{(kind === "planned" ? m.planned : m.isForecast ? m.actual.map(() => MISSING) : m.actual).map((c, i) => (
						<div key={i} className="wwc:aspect-square wwc:rounded-[1px]" style={{backgroundColor: c}} />
					))}
				</div>
			</div>
		);
		const history = progression.filter((m) => !m.isForecast);
		const forecast = progression.filter((m) => m.isForecast);
		const divider = (withLabel: boolean) => (
			<div className="wwc:relative wwc:flex wwc:shrink-0 wwc:items-start wwc:justify-center">
				{/* On the top (actual) row, extend the line down through the inter-row gap (gap-6 = 1.5rem) so the
            forecast divider reads as one continuous line across both rows. */}
				<div
					className={cn(
						"wwc:w-px wwc:rounded-full wwc:bg-white/40",
						withLabel ? "wwc:h-[calc(100%+1.5rem)]" : "wwc:h-full",
					)}
				/>
				{withLabel && (
					<span className="wwc:absolute wwc:-top-5 wwc:left-1/2 wwc:-translate-x-1/2 wwc:whitespace-nowrap wwc:rounded-full wwc:border wwc:border-white/20 wwc:bg-white/10 wwc:px-2 wwc:py-0.5 wwc:text-[9px] wwc:font-bold wwc:uppercase wwc:tracking-wider wwc:text-white/80 wwc:backdrop-blur">
						Forecast
					</span>
				)}
			</div>
		);
		const row = (kind: "actual" | "planned", withLabel: boolean) => (
			<div className="wwc:flex wwc:items-stretch wwc:gap-3">
				{/* Row label rotated vertical so it barely takes any width. */}
				<div className="wwc:flex wwc:w-4 wwc:shrink-0 wwc:items-center wwc:justify-center">
					<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-[0.15em] wwc:text-white/50 wwc:[writing-mode:vertical-rl] wwc:rotate-180 wwc:whitespace-nowrap">
						{kind === "actual" ? "Actual" : "Planned"}
					</span>
				</div>
				<div className="wwc:flex wwc:flex-[4] wwc:gap-5">{history.map((m) => card(m, kind))}</div>
				{divider(withLabel)}
				<div className="wwc:flex wwc:flex-[2] wwc:gap-5">{forecast.map((m) => card(m, kind))}</div>
			</div>
		);
		return (
			<div className="wwc:flex wwc:flex-col wwc:gap-6">
				{row("actual", true)}
				{row("planned", false)}
			</div>
		);
	}, [progression, gridCols]);

	// On any open/close, snap the scroll back to the top so the slide-up entrance (and slide-down exit) start
	// from the resting layout (grid 80% · gap 5% · peek 15%), and clear the overscroll accumulator.
	useEffect(() => {
		overscrollRef.current = 0;
		const el = reportsScrollRef.current;
		if (el) el.scrollTop = 0;
		onReportScroll(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reportsOpen]);

	// Map a calendar date to the week that contains it (clamped to the timeline's range), then select it.
	const pickDate = (d: Date | undefined) => {
		if (!d) return;
		const t = d.getTime();
		const week =
			t < firstWeek.start.getTime()
				? firstWeek
				: t > lastWeek.end.getTime()
					? lastWeek
					: (timeline.find((w) => t >= w.start.getTime() && t <= w.end.getTime()) ?? selectedWeek);
		onCaptureChange(week.value);
		setDatePickerOpen(false);
	};

	return (
		<>
			{/* ===== Bottom toolbar (Reports · Timeline) — the "Timeline" button opens the draggable week
          scrubber directly above it. ===== */}
			<div
				className={cn(
					"wwc:absolute wwc:bottom-4 wwc:left-1/2 wwc:z-20 wwc:flex wwc:-translate-x-1/2 wwc:flex-col wwc:items-center wwc:gap-2",
					chromeFade,
				)}
			>
				{/* Timeline scrubber — a draggable scrubber over week tick lines; the first week of each month
            shows the month name in place of the week number. Shown above the toolbar when toggled on. */}
				{timelineOpen && (
					<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:px-3 wwc:py-1.5 wwc:shadow-lg">
						<Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
							<PopoverTrigger asChild>
								<button
									type="button"
									aria-label="Pick a date"
									className="wwc:group wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:py-1 wwc:transition-colors"
								>
									<Calendar className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground wwc:transition-colors wwc:group-hover:text-foreground" />
									<span className="wwc:w-[190px] wwc:whitespace-nowrap wwc:text-left wwc:text-sm wwc:font-semibold wwc:transition-colors wwc:group-hover:text-primary">
										{rangeLabel}
									</span>
								</button>
							</PopoverTrigger>
							<PopoverContent side="top" align="start" sideOffset={12} className="wwc:w-auto wwc:p-0">
								<DatePickerCalendar
									mode="single"
									selected={selectedWeek.start}
									defaultMonth={selectedWeek.start}
									disabled={{before: firstWeek.start, after: lastWeek.end}}
									onSelect={pickDate}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						<WeekTimeline weeks={timeline} value={capture} onChange={onCaptureChange} />
					</div>
				)}

				<div className="wwc:flex wwc:items-center wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-1 wwc:shadow-lg">
					<button
						type="button"
						aria-pressed={reportsOpen}
						onClick={() => onReportsOpenChange(!reportsOpen)}
						className={cn(
							"wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:px-2.5 wwc:py-1.5 wwc:text-sm wwc:font-medium wwc:transition-colors",
							reportsOpen ? "wwc:bg-primary/10 wwc:text-primary" : "wwc:text-foreground wwc:hover:bg-accent",
						)}
					>
						<FileText className={cn("wwc:size-3.5", reportsOpen ? "wwc:text-primary" : "wwc:text-muted-foreground")} />
						Progress Overview
					</button>
					{/* Timeline slot — clicking opens the scrubber; hovering reveals an upward dropdown with
              Timeline and a "coming soon" Drone playback. */}
					<div
						className="wwc:relative"
						onMouseEnter={() => setTimelineMenuOpen(true)}
						onMouseLeave={() => setTimelineMenuOpen(false)}
					>
						<button
							type="button"
							aria-pressed={timelineOpen}
							aria-haspopup="menu"
							aria-expanded={timelineMenuOpen}
							onClick={() => {
								setTimelineOpen((o) => !o);
								setTimelineMenuOpen(false);
							}}
							className={cn(
								"wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:px-2.5 wwc:py-1.5 wwc:text-sm wwc:font-medium wwc:transition-colors",
								timelineOpen ? "wwc:bg-primary/10 wwc:text-primary" : "wwc:text-foreground wwc:hover:bg-accent",
							)}
						>
							<GanttChart
								className={cn("wwc:size-3.5", timelineOpen ? "wwc:text-primary" : "wwc:text-muted-foreground")}
							/>
							Timeline
						</button>

						{timelineMenuOpen ? (
							<div className="wwc:absolute wwc:bottom-full wwc:left-1/2 wwc:z-30 wwc:-translate-x-1/2 wwc:pb-1.5">
								<div
									role="menu"
									className="wwc:min-w-[240px] wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-1 wwc:shadow-lg"
								>
									<button
										type="button"
										role="menuitem"
										onClick={() => {
											setTimelineMenuOpen(false);
											setTimelineOpen(true);
										}}
										className={cn(
											"wwc:flex wwc:w-full wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2.5 wwc:py-2 wwc:text-sm wwc:font-medium wwc:transition-colors",
											timelineOpen ? "wwc:bg-primary/10 wwc:text-primary" : "wwc:text-foreground wwc:hover:bg-accent",
										)}
									>
										<GanttChart className="wwc:size-4 wwc:shrink-0" />
										<span className="wwc:flex-1 wwc:whitespace-nowrap wwc:text-left">Timeline</span>
										{timelineOpen ? <Check className="wwc:size-4 wwc:shrink-0" /> : null}
									</button>
									<button
										type="button"
										role="menuitem"
										disabled
										aria-disabled="true"
										className="wwc:flex wwc:w-full wwc:cursor-not-allowed wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2.5 wwc:py-2 wwc:text-sm wwc:font-medium wwc:text-muted-foreground"
									>
										<Plane className="wwc:size-4 wwc:shrink-0" />
										<span className="wwc:flex-1 wwc:whitespace-nowrap wwc:text-left">Drone playback</span>
										<span className="wwc:shrink-0 wwc:rounded wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground">
											Coming soon
										</span>
									</button>
								</div>
							</div>
						) : null}
					</div>
				</div>
			</div>

			{/* ===== Reports scroll page — clicking Reports peeks the report up ~15% (smooth) and blurs +
          darkens the map; from there it's a normal page scroll (the report scrolls up over the map).
          Kept mounted; pointer-events off while closed. ===== */}
			<div
				className={cn("wwc:absolute wwc:inset-0 wwc:z-40", reportsOpen ? "" : "wwc:pointer-events-none")}
				aria-hidden={!reportsOpen}
			>
				{/* Dark + blur over the map — fades in on open. */}
				<div
					className={cn(
						"wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:bg-black/60 wwc:backdrop-blur-md wwc:transition-opacity wwc:duration-500 wwc:ease-out",
						reportsOpen ? "wwc:opacity-100" : "wwc:opacity-0",
					)}
				/>
				{/* Close */}
				<button
					type="button"
					aria-label="Close reports"
					onClick={() => onReportsOpenChange(false)}
					className={cn(
						"wwc:absolute wwc:right-4 wwc:top-4 wwc:z-20 wwc:flex wwc:size-9 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-card/90 wwc:text-foreground wwc:shadow-lg wwc:backdrop-blur-sm wwc:transition-opacity wwc:duration-500 wwc:hover:bg-accent",
						reportsOpen ? "wwc:opacity-100" : "wwc:pointer-events-none wwc:opacity-0",
					)}
				>
					<X className="wwc:size-4" />
				</button>
				{/* Scroll layer: slides UP from below on open (and back down on close); once up it's a normal
            page scroll. Overscrolling past the top dismisses (see onReportsWheel). */}
				<div
					ref={reportsScrollRef}
					onScroll={(e) => onReportScroll(e.currentTarget.scrollTop)}
					onWheel={onReportsWheel}
					className={cn(
						"wwc:absolute wwc:inset-0 wwc:z-10 wwc:overflow-y-auto wwc:overscroll-contain wwc:transition-transform wwc:duration-[550ms] wwc:ease-out",
						reportsOpen ? "wwc:translate-y-0" : "wwc:translate-y-full",
					)}
				>
					{/* Hero — the Milestone Progression: 6 monthly villa grids (4 history · divider · 2 forecast),
              actual over planned, using the milestone-legend colours. No panels — bare over the blurred
              dark map, light text for dark mode. 80% of screen. */}
					<div className="wwc:relative wwc:flex wwc:min-h-[80%] wwc:flex-col wwc:px-16 wwc:pb-4 wwc:pt-6 wwc:text-white">
						{/* Section header — eyebrow · display heading · subtitle on the left, section actions on the
                right (layout from the PROGRESS · ALL VILLAS reference; Core styling in dark mode). */}
						<div className="wwc:mb-4 wwc:flex wwc:shrink-0 wwc:items-start wwc:justify-between wwc:gap-4">
							<div className="wwc:min-w-0">
								<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-[11px] wwc:font-bold wwc:uppercase wwc:tracking-[0.18em]">
									<span className="wwc:text-orange-400">§1</span>
									<span className="wwc:text-white/50">Progress · All villas</span>
								</div>
								<h2 className="wwc:mt-1.5 wwc:text-3xl wwc:font-semibold wwc:tracking-tight wwc:text-white">
									Every villa&apos;s milestone, month by month.
								</h2>
								<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-sm wwc:leading-relaxed wwc:text-white/55">
									Actual vs planned milestone stage for all villas, faceted by month (Jun–Nov &apos;26). Squares climb
									the M35→M100 ramp as villas advance; September is the data date.
								</p>
							</div>
							<div className="wwc-invert wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
								{/* No-op with no Capture source — hidden in the wired progression-report mode. */}
								{!showOnlyProgressionReport && (
									<Button variant="secondary" size="lg">
										<Play />
										Drone playback
									</Button>
								)}
								<Button variant="secondary" size="lg">
									<GanttChart />
									Timeline
								</Button>
							</div>
						</div>
						{/* Milestone-ramp legend (the real SPA legend colours). */}
						<div className="wwc:mb-4 wwc:flex wwc:shrink-0 wwc:flex-wrap wwc:items-center wwc:gap-x-3 wwc:gap-y-1 wwc:text-[11px] wwc:font-medium wwc:text-white/60">
							{PROGRESS_LEGEND_ITEMS.filter((l) => l.id !== "missing" && l.id !== "unlinked").map((l) => (
								<span key={l.id} className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span className="wwc:size-2.5 wwc:rounded-[2px]" style={{backgroundColor: l.color}} />
									{l.label}
								</span>
							))}
						</div>
						{/* Progression grids — height flexes to the waffle content (grows with the villa count). */}
						<div ref={gridRef}>{progressionView}</div>
					</div>
					{!showOnlyProgressionReport && (
						<>
							{/* 5% padding gap — the blurred map shows through between the grid and the report. */}
							<div className="wwc:h-[5%]" />
							<div className="wwc:min-h-full wwc:rounded-t-3xl wwc:bg-[#0b1220] wwc:px-16 wwc:pb-16 wwc:pt-5 wwc:text-white wwc:shadow-[0_-24px_60px_rgba(0,0,0,0.55)]">
								{/* Full-width to match the milestone-progression hero above (px-8, no max-width). */}
								<div>
									<div className="wwc:mx-auto wwc:mb-6 wwc:h-1 wwc:w-10 wwc:rounded-full wwc:bg-white/20" />
									{/* Only the plan-vs-reality milestone-timing section (§2 Value, §4 Forecast and the recovery
                      scenario were removed per the progress-overview trim). */}
									<ReportSections />
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
}
