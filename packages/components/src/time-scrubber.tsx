import {cn} from "@wakecap/core-utils";
import {addMinutes, format} from "date-fns";
import {ChevronDown, ChevronUp, Pause, Play, RotateCcw} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Calendar} from "./calendar";
import {FLOAT_SHADOW} from "./float-shadow";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";

// TimeScrubber — a minimal, precise intraday timeline (Evercam ETimeline style). A fine tick axis with
// labelled majors and a section header, a left row-label chip, and one of three data tracks: barGraph,
// lineGraph, or dots. Drag anywhere to scrub the cursor. Controlled via `value` / `onValueChange`;
// built to overlay media or a 3D scene.

export type TimeScrubberVariant = "barGraph" | "lineGraph" | "dots";

export interface TimeSeriesPoint {
	/** A sample time within [start, end]. */
	time: Date;
	/** The metric at that time (bar/line height, relative to the series max). */
	value: number;
	/** Optional stacked bar segments, bottom→top. Their sum should equal `value`; each carries a bg class. */
	segments?: {value: number; className?: string}[];
	/** Tooltip shown on hover over this bar (e.g. the active-vs-inactive breakdown). */
	title?: string;
}

export interface TimeScrubberLegendItem {
	/** Swatch caption, e.g. "Open". */
	label: string;
	/** Swatch colour, any CSS colour. Use `className` instead when the series segments are class-coloured. */
	color?: string;
	/** Swatch background class — pass the same class the matching `segments[].className` uses. */
	className?: string;
}

export interface TimeScrubberProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Range start (e.g. today 00:00). */
	start: Date;
	/** Range end (e.g. today 24:00). */
	end: Date;
	/** How the data reads. Default "barGraph". */
	variant?: TimeScrubberVariant;
	/** The series for bar/line tracks. For dots, points with `value > 0` become dots. */
	data?: TimeSeriesPoint[];
	/** Left row-label chip, e.g. "Workers". */
	label?: React.ReactNode;
	/** Cursor position (controlled). Scrubbing is enabled when `onValueChange` is given. */
	value?: Date;
	onValueChange?: (time: Date) => void;
	/**
	 * Selected range (controlled). Providing it puts a second handle on the track: drag either end, and
	 * the band between them is the selection. `value` stays the playhead, so a range and a cursor can
	 * coexist. Use it when the surface reads a window of time rather than a single moment.
	 */
	rangeValue?: [Date, Date];
	onRangeValueChange?: (range: [Date, Date]) => void;
	/** Latest scrubbable/playable time — the cursor can't move past it (e.g. "now" on a live day). */
	max?: Date;
	/** Minutes between minor ticks. Default 60. */
	minorEveryMinutes?: number;
	/** Minutes between labelled major ticks. Default 180. */
	majorEveryMinutes?: number;
	/** Header shown above the axis (e.g. the date). Ignored when `date` is set. */
	sectionLabel?: React.ReactNode;
	/** The day the axis covers. When `onDateChange` is given, the header becomes a date picker. */
	date?: Date;
	onDateChange?: (date: Date) => void;
	/** Latest selectable day in the picker (future days are disabled). Default: today. */
	maxDate?: Date;
	/** Format the header date. Default "EEE, d MMM". */
	formatDate?: (d: Date) => string;
	/** Rendered next to the cursor time — e.g. the value at the cursor. */
	valueLabel?: React.ReactNode;
	/**
	 * Swatch legend shown in the header, for reading a stacked `segments` track. Keep it to a handful
	 * of entries — the header is a single row and competes with the date, controls and cursor readout.
	 */
	legend?: TimeScrubberLegendItem[];
	/** Playing state (controlled); the cursor advances by `playSpeed`. */
	playing?: boolean;
	onPlayingChange?: (playing: boolean) => void;
	/** When given, a "Now" control resets the cursor to the current time (and today). */
	onNow?: () => void;
	/** Start the timeline collapsed to just the track (bars + cursor). Default false. */
	defaultCollapsed?: boolean;
	/** Collapsed state (controlled). Pair with `onCollapsedChange` when the surrounding layout reacts to it. */
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/** Simulated minutes advanced per real second while playing. Default 120. */
	playSpeed?: number;
	/** Show the play/pause control. Default true when scrubbing is enabled. */
	showControls?: boolean;
	/** Format tick labels. Default HH:mm. */
	formatTick?: (t: Date) => string;
	/** Format the cursor readout. Default HH:mm. */
	formatTime?: (t: Date) => string;
	/** Track height in px. Default 44. */
	height?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Don't zoom in past a 15-minute window.
const MIN_VISIBLE_MS = 15 * 60_000;

// Tick spacing (minutes) that keeps a sensible density as the visible window narrows.
const niceMinor = (visMin: number) => (visMin <= 90 ? 10 : visMin <= 240 ? 15 : visMin <= 600 ? 30 : 60);
const niceMajor = (visMin: number) => (visMin <= 90 ? 30 : visMin <= 240 ? 60 : visMin <= 600 ? 120 : 180);

/** A minimal, precise intraday timeline with bar / line / dots tracks. */
export function TimeScrubber({
	start,
	end,
	variant = "barGraph",
	data = [],
	label,
	value,
	onValueChange,
	rangeValue,
	onRangeValueChange,
	max,
	minorEveryMinutes = 60,
	majorEveryMinutes = 180,
	sectionLabel,
	date,
	onDateChange,
	maxDate,
	formatDate = (d) => format(d, "EEE, d MMM"),
	valueLabel,
	legend,
	playing = false,
	onPlayingChange,
	onNow,
	defaultCollapsed = false,
	collapsed: collapsedProp,
	onCollapsedChange,
	playSpeed = 120,
	showControls,
	formatTick = (t) => format(t, "HH:mm"),
	formatTime = (t) => format(t, "HH:mm"),
	height = 28,
	className,
	...props
}: TimeScrubberProps) {
	const trackRef = React.useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = React.useState(false);
	const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(defaultCollapsed);
	const collapsed = collapsedProp ?? uncontrolledCollapsed;
	const setCollapsed = (next: boolean) => {
		if (collapsedProp == null) setUncontrolledCollapsed(next);
		onCollapsedChange?.(next);
	};
	// The bar under the pointer, for a styled hover tooltip (title + horizontal position).
	const [hoveredBar, setHoveredBar] = React.useState<{title: string; left: number} | null>(null);

	const startMs = start.getTime();
	const totalMs = Math.max(1, end.getTime() - startMs);
	// Cursor can't move past `max` (e.g. "now"); defaults to the end of the range.
	const maxMs = max ? clamp(max.getTime(), startMs, startMs + totalMs) : startMs + totalMs;

	// Visible sub-window for scroll-to-zoom. Defaults to the whole range; resets when the range changes.
	const [view, setView] = React.useState({start: startMs, end: startMs + totalMs});
	React.useEffect(() => {
		setView({start: startMs, end: startMs + totalMs});
	}, [startMs, totalMs]);
	const viewStart = clamp(view.start, startMs, startMs + totalMs - MIN_VISIBLE_MS);
	const visibleMs = clamp(view.end - viewStart, MIN_VISIBLE_MS, startMs + totalMs - viewStart);
	const viewEnd = viewStart + visibleMs;
	const isFullView = viewStart <= startMs && viewEnd >= startMs + totalMs;

	const xPct = (t: Date) => ((t.getTime() - viewStart) / visibleMs) * 100;
	const rangeMode = rangeValue != null && typeof onRangeValueChange === "function";
	const scrubbable = typeof onValueChange === "function" || rangeMode;
	// Which end is being dragged; chosen on pointer-down by proximity and held for the whole drag, so a
	// handle dragged past its partner does not hand over mid-gesture.
	const dragHandleRef = React.useRef<0 | 1 | null>(null);
	const cursorRaw = value ? xPct(value) : null;
	const cursorPct = cursorRaw != null && cursorRaw >= 0 && cursorRaw <= 100 ? cursorRaw : null;
	const controls = showControls ?? scrubbable;

	// ── Scroll to zoom (anchored at the pointer). Native non-passive listener so preventDefault works. ──
	const viewRef = React.useRef(view);
	viewRef.current = view;
	React.useEffect(() => {
		const el = trackRef.current;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const f = clamp((e.clientX - rect.left) / rect.width, 0, 1);
			const v = viewRef.current;
			const vis = v.end - v.start;
			const anchor = v.start + f * vis;
			const nextVis = clamp(vis * (e.deltaY < 0 ? 0.82 : 1 / 0.82), MIN_VISIBLE_MS, totalMs);
			let ns = anchor - f * nextVis;
			let ne = ns + nextVis;
			if (ns < startMs) {
				ns = startMs;
				ne = startMs + nextVis;
			}
			if (ne > startMs + totalMs) {
				ne = startMs + totalMs;
				ns = ne - nextVis;
			}
			setView({start: Math.max(startMs, ns), end: ne});
		};
		el.addEventListener("wheel", onWheel, {passive: false});
		return () => el.removeEventListener("wheel", onWheel);
	}, [startMs, totalMs]);

	// ── Seeking (within the visible window) ──
	const seekTo = React.useCallback(
		(clientX: number) => {
			const el = trackRef.current;
			if (!el || (!onValueChange && !onRangeValueChange)) return;
			const rect = el.getBoundingClientRect();
			const f = clamp((clientX - rect.left) / rect.width, 0, 1);
			const v = viewRef.current;
			const t = clamp(v.start + f * (v.end - v.start), startMs, maxMs);

			if (rangeValue && onRangeValueChange) {
				const [lo, hi] = [rangeValue[0].getTime(), rangeValue[1].getTime()];
				const which = dragHandleRef.current ?? (Math.abs(t - lo) <= Math.abs(t - hi) ? 0 : 1);
				dragHandleRef.current = which;
				// Ends cannot cross: each is clamped against the other.
				onRangeValueChange(
					which === 0 ? [new Date(Math.min(t, hi)), rangeValue[1]] : [rangeValue[0], new Date(Math.max(t, lo))],
				);
				return;
			}
			onValueChange?.(new Date(t));
		},
		[onValueChange, rangeValue, onRangeValueChange, startMs, maxMs],
	);

	// ── Playback ──
	const valueRef = React.useRef(value);
	valueRef.current = value;
	const onChangeRef = React.useRef(onValueChange);
	onChangeRef.current = onValueChange;
	React.useEffect(() => {
		if (!playing || !value) return;
		const tickMs = 200;
		const id = window.setInterval(() => {
			const cur = valueRef.current;
			if (!cur) return;
			const advanced = cur.getTime() + playSpeed * (tickMs / 1000) * 60000;
			if (advanced >= maxMs) {
				onChangeRef.current?.(new Date(maxMs));
				onPlayingChange?.(false);
			} else {
				onChangeRef.current?.(new Date(advanced));
			}
		}, tickMs);
		return () => window.clearInterval(id);
	}, [playing, value, playSpeed, maxMs, onPlayingChange]);

	// ── Ticks (aligned to the range start; spacing adapts to the zoom; only the visible ones render) ──
	const visMin = visibleMs / 60_000;
	const minorMin = isFullView ? minorEveryMinutes : niceMinor(visMin);
	const majorMin = isFullView ? majorEveryMinutes : niceMajor(visMin);
	const endMs = startMs + totalMs;
	const inWindow = (ms: number) => {
		const p = ((ms - viewStart) / visibleMs) * 100;
		return p >= -2 && p <= 102;
	};
	const minorTicks: Date[] = [];
	for (let ms = startMs; ms <= endMs; ms += minorMin * 60_000) if (inWindow(ms)) minorTicks.push(new Date(ms));
	const majorTicks: Date[] = [];
	for (let ms = startMs; ms <= endMs; ms += majorMin * 60_000) if (inWindow(ms)) majorTicks.push(new Date(ms));

	// ── Data geometry ──
	const maxValue = data.length ? Math.max(1, ...data.map((d) => d.value)) : 1;
	const barWidthPct = data.length > 1 ? Math.max(0.4, Math.abs(xPct(data[1].time) - xPct(data[0].time)) * 0.85) : 1.5;
	const linePath = React.useMemo(() => {
		if (variant !== "lineGraph" || data.length === 0) return {line: "", area: ""};
		const pts = data.map((d) => [xPct(d.time), 100 - (d.value / maxValue) * 100] as const);
		const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
		const area = `${line} L${pts[pts.length - 1][0]},100 L${pts[0][0]},100 Z`;
		return {line, area};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [variant, data, maxValue, viewStart, visibleMs]);

	return (
		<div
			className={cn(
				"wwc:mx-auto wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:px-2.5 wwc:py-1 wwc:backdrop-blur wwc:transition-[width] wwc:duration-300 wwc:ease-out",
				FLOAT_SHADOW,
				// Collapsed: a slimmer, centred strip; expanded: full width. Width animates between the two.
				collapsed ? "wwc:w-3/4" : "wwc:w-full",
				className,
			)}
			{...props}
		>
			{/* Controls: collapse toggle, date picker, play/pause, back-to-now — readout on the right. */}
			{!collapsed && (sectionLabel != null || date != null || value != null || controls || onNow || legend?.length) && (
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:pb-0.5">
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-muted-foreground">
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label="Collapse timeline"
							className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground"
							onClick={() => setCollapsed(true)}
						>
							<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
						</Button>
						{date != null && onDateChange ? (
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded wwc:text-xs wwc:font-medium wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground"
									>
										{formatDate(date)}
										<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
									</button>
								</PopoverTrigger>
								<PopoverContent align="start" className="wwc:w-auto wwc:p-0">
									<Calendar
										mode="single"
										size="compact"
										selected={date}
										defaultMonth={date}
										onSelect={(d) => d && onDateChange(d)}
										disabled={{after: maxDate ?? new Date()}}
									/>
								</PopoverContent>
							</Popover>
						) : (sectionLabel ?? (date ? formatDate(date) : null)) != null ? (
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
								{sectionLabel ?? (date ? formatDate(date) : null)}
							</span>
						) : null}
						{(date != null || sectionLabel != null) && ((controls && value) || onNow) && (
							<span aria-hidden className="wwc:h-4 wwc:w-px wwc:bg-border" />
						)}
						{controls && value && (
							<Button
								variant="ghost"
								size="sm"
								icon
								aria-label={playing ? "Pause" : "Play"}
								className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground"
								onClick={() => onPlayingChange?.(!playing)}
							>
								{playing ? <Pause className="wwc:h-3.5 wwc:w-3.5" /> : <Play className="wwc:h-3.5 wwc:w-3.5" />}
							</Button>
						)}
						{onNow && (
							<Button
								variant="ghost"
								size="sm"
								aria-label="Back to now"
								className="wwc:h-6 wwc:gap-1 wwc:px-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground"
								onClick={onNow}
							>
								<RotateCcw className="wwc:h-3.5 wwc:w-3.5" />
								Now
							</Button>
						)}
					</div>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						{legend != null && legend.length > 0 && (
							<>
								<div className="wwc:flex wwc:items-center wwc:gap-2.5">
									{legend.map((item) => (
										<span
											key={item.label}
											className="wwc:flex wwc:items-center wwc:gap-1 wwc:text-[11px] wwc:text-muted-foreground"
										>
											<span
												aria-hidden
												className={cn("wwc:h-2 wwc:w-2 wwc:shrink-0 wwc:rounded-[2px]", item.className)}
												style={item.color ? {backgroundColor: item.color} : undefined}
											/>
											{item.label}
										</span>
									))}
								</div>
								{(value != null || valueLabel != null) && (
									<span aria-hidden className="wwc:h-4 wwc:w-px wwc:bg-border" />
								)}
							</>
						)}
						{value && <span className="wwc:text-sm wwc:font-semibold wwc:tabular-nums">{formatTime(value)}</span>}
						{valueLabel != null && <span className="wwc:text-xs wwc:text-muted-foreground">{valueLabel}</span>}
					</div>
				</div>
			)}

			<div className={cn("wwc:flex wwc:gap-2", collapsed ? "wwc:items-center" : "wwc:items-stretch")}>
				{collapsed ? (
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label="Expand timeline"
						className="wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:text-muted-foreground"
						onClick={() => setCollapsed(false)}
					>
						<ChevronUp className="wwc:h-3.5 wwc:w-3.5" />
					</Button>
				) : (
					label != null && (
						<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:self-end">
							<span className="wwc:rounded wwc:bg-primary/10 wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:font-medium wwc:text-primary">
								{label}
							</span>
						</div>
					)
				)}

				<div
					ref={trackRef}
					role={scrubbable ? "slider" : undefined}
					tabIndex={scrubbable ? 0 : undefined}
					aria-label={scrubbable ? "Time" : undefined}
					aria-valuetext={value ? formatTime(value) : undefined}
					className={cn(
						"wwc:relative wwc:min-w-0 wwc:flex-1 wwc:touch-none wwc:select-none",
						scrubbable && "wwc:cursor-pointer",
					)}
					style={{height: collapsed ? 22 : height + 12}}
					title={isFullView ? "Scroll to zoom" : "Double-click to reset zoom"}
					onDoubleClick={() => setView({start: startMs, end: startMs + totalMs})}
					onPointerDown={
						scrubbable
							? (e) => {
									e.currentTarget.setPointerCapture(e.pointerId);
									setDragging(true);
									seekTo(e.clientX);
								}
							: undefined
					}
					onPointerMove={scrubbable ? (e) => dragging && seekTo(e.clientX) : undefined}
					onPointerUp={
						scrubbable
							? (e) => {
									setDragging(false);
									dragHandleRef.current = null;
									e.currentTarget.releasePointerCapture(e.pointerId);
								}
							: undefined
					}
					onKeyDown={
						scrubbable && value
							? (e) => {
									if (e.key === "ArrowLeft") {
										e.preventDefault();
										onValueChange?.(new Date(clamp(addMinutes(value, -minorEveryMinutes).getTime(), startMs, maxMs)));
									} else if (e.key === "ArrowRight") {
										e.preventDefault();
										onValueChange?.(new Date(clamp(addMinutes(value, minorEveryMinutes).getTime(), startMs, maxMs)));
									}
								}
							: undefined
					}
				>
					{/* Tick labels — hidden when collapsed; edge labels align inward so they never float past. */}
					{!collapsed && (
						<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:top-0 wwc:h-3">
							{majorTicks.map((t) => {
								const pct = xPct(t);
								const transform = pct <= 0.5 ? "translateX(0)" : pct >= 99.5 ? "translateX(-100%)" : "translateX(-50%)";
								return (
									<span
										key={t.getTime()}
										className="wwc:absolute wwc:text-[10px] wwc:tabular-nums wwc:leading-none wwc:text-muted-foreground"
										style={{left: `${pct}%`, transform}}
									>
										{formatTick(t)}
									</span>
								);
							})}
						</div>
					)}

					{/* Plot area: ticks behind, data in front */}
					<div className={cn("wwc:absolute wwc:inset-x-0 wwc:bottom-0", collapsed ? "wwc:top-0" : "wwc:top-3")}>
						{/* Ticks */}
						<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0">
							{minorTicks.map((t) => (
								<span
									key={t.getTime()}
									className="wwc:absolute wwc:top-0 wwc:h-1.5 wwc:w-px wwc:bg-border"
									style={{left: `${xPct(t)}%`}}
								/>
							))}
							{majorTicks.map((t) => (
								<span
									key={`M${t.getTime()}`}
									className="wwc:absolute wwc:top-0 wwc:h-2 wwc:w-px wwc:bg-border"
									style={{left: `${xPct(t)}%`}}
								/>
							))}
							<span className="wwc:absolute wwc:inset-x-0 wwc:bottom-0 wwc:h-px wwc:bg-border" />
						</div>

						{/* barGraph — bars positioned by time so they track the zoom window. Interactive so each bar
						    can show its own tooltip; pointer events still bubble to the track for scrubbing. */}
						{variant === "barGraph" && data.length > 0 && (
							<div className="wwc:absolute wwc:inset-x-0 wwc:bottom-px wwc:top-1 wwc:overflow-hidden">
								{data.map((d) => {
									const left = xPct(d.time);
									if (left < -barWidthPct || left > 100 + barWidthPct) return null;
									// Zero (e.g. the rest of the day / future) draws no bar.
									if (d.value <= 0) return null;
									const height = Math.max(2, (d.value / maxValue) * 100);
									const style = {left: `${left}%`, width: `${barWidthPct}%`, height: `${height}%`};
									const hover = d.title
										? {
												onMouseEnter: () => setHoveredBar({title: d.title as string, left}),
												onMouseLeave: () => setHoveredBar(null),
											}
										: undefined;
									// Stacked segments (e.g. active / inactive) render bottom→top with their own colours.
									if (d.segments && d.segments.length > 0) {
										return (
											<span
												key={d.time.getTime()}
												{...hover}
												className="wwc:absolute wwc:bottom-0 wwc:flex wwc:flex-col-reverse wwc:overflow-hidden wwc:rounded-t-[1px]"
												style={style}
											>
												{d.segments.map((seg, i) => (
													<span
														key={seg.className ?? `seg-${i}`}
														className={cn("wwc:w-full", seg.className ?? "wwc:bg-primary/30")}
														style={{height: `${(seg.value / d.value) * 100}%`}}
													/>
												))}
											</span>
										);
									}
									return (
										<span
											key={d.time.getTime()}
											{...hover}
											className="wwc:absolute wwc:bottom-0 wwc:rounded-t-[1px] wwc:bg-primary/30"
											style={style}
										/>
									);
								})}
							</div>
						)}

						{/* Styled hover tooltip for the bar under the pointer (Wakecore tooltip look). */}
						{hoveredBar && (
							<div
								className="wwc:pointer-events-none wwc:absolute wwc:bottom-full wwc:z-50 wwc:mb-1.5 wwc:-translate-x-1/2 wwc:whitespace-nowrap wwc:rounded-md wwc:bg-primary wwc:px-2 wwc:py-1 wwc:text-[11px] wwc:font-medium wwc:text-primary-foreground wwc:shadow-md"
								style={{left: `${hoveredBar.left}%`}}
							>
								{hoveredBar.title}
							</div>
						)}

						{/* lineGraph */}
						{variant === "lineGraph" && data.length > 0 && (
							<svg
								className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:bottom-px wwc:top-1 wwc:overflow-hidden"
								style={{height: "calc(100% - 1px)", width: "100%"}}
								viewBox="0 0 100 100"
								preserveAspectRatio="none"
							>
								<path d={linePath.area} className="wwc:fill-primary/15" />
								<path
									d={linePath.line}
									className="wwc:fill-none wwc:stroke-primary"
									strokeWidth={1.25}
									vectorEffect="non-scaling-stroke"
								/>
							</svg>
						)}

						{/* dots */}
						{variant === "dots" && (
							<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:top-1/2 wwc:h-0 wwc:overflow-visible">
								<span className="wwc:absolute wwc:inset-x-0 wwc:top-0 wwc:h-px wwc:-translate-y-1/2 wwc:bg-border" />
								{data
									.filter((d) => d.value > 0 && xPct(d.time) >= 0 && xPct(d.time) <= 100)
									.map((d) => (
										<span
											key={d.time.getTime()}
											className="wwc:absolute wwc:top-0 wwc:h-1.5 wwc:w-1.5 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:rounded-full wwc:bg-primary"
											style={{left: `${xPct(d.time)}%`}}
										/>
									))}
							</div>
						)}

						{/* Range band — the selected window, with a handle at each end. */}
						{rangeValue && (
							<>
								<div
									className="wwc:pointer-events-none wwc:absolute wwc:inset-y-0 wwc:bg-primary/15"
									style={{
										left: `${clamp(xPct(rangeValue[0]), 0, 100)}%`,
										width: `${clamp(xPct(rangeValue[1]), 0, 100) - clamp(xPct(rangeValue[0]), 0, 100)}%`,
									}}
								/>
								{rangeValue.map((edge, i) => {
									const pct = xPct(edge);
									if (pct < 0 || pct > 100) return null;
									return (
										<div
											key={i === 0 ? "range-start" : "range-end"}
											className="wwc:pointer-events-none wwc:absolute wwc:inset-y-0 wwc:w-px wwc:-translate-x-1/2 wwc:bg-primary"
											style={{left: `${pct}%`}}
										>
											<span className="wwc:absolute wwc:-top-1 wwc:left-1/2 wwc:h-2.5 wwc:w-2.5 wwc:-translate-x-1/2 wwc:rounded-[2px] wwc:border-2 wwc:border-background wwc:bg-primary wwc:shadow" />
										</div>
									);
								})}
							</>
						)}

						{/* Cursor */}
						{cursorPct != null && (
							<div
								className="wwc:pointer-events-none wwc:absolute wwc:inset-y-0 wwc:w-px wwc:-translate-x-1/2 wwc:bg-primary"
								style={{left: `${cursorPct}%`}}
							>
								<span className="wwc:absolute wwc:-top-1 wwc:left-1/2 wwc:h-2.5 wwc:w-2.5 wwc:-translate-x-1/2 wwc:rounded-full wwc:border-2 wwc:border-background wwc:bg-primary wwc:shadow" />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// Kept for back-compat with existing imports.
export type {TimeSeriesPoint as TimeScrubberActivity};
