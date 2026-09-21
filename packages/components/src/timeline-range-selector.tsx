import {cn} from "@wakecap/core-utils";
import {format, isAfter, isBefore, subMonths, subYears} from "date-fns";
import {ChevronDown} from "lucide-react";
import * as React from "react";

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";

// ============================================================================
// Types
// ============================================================================

/** A single day entry plotted on the timeline. `count` drives bar height (dot variant ignores it). */
export interface TimelineDay {
	date: Date;
	count?: number;
}

/** Total timespan shown by the timeline. Selecting one resets the window to the matching trailing period. */
export type TimelinePeriod = "all" | "1y" | "3m" | "1m";

export interface TimelineRangeSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Every day entry available. The visible window is derived from `period` (trailing from the latest date). */
	data: TimelineDay[];
	/** Controls the visible timespan. Changing it resets the timeline to the corresponding trailing window. Default `3m`. */
	period?: TimelinePeriod;
	/** Fires when the user picks a different period from the dropdown. */
	onPeriodChange?: (period: TimelinePeriod) => void;
	/** The selected date range (controlled). Unset defaults to the full visible range. */
	selectedRange?: [Date, Date];
	/** Fires when a handle is dragged to a new range. Snaps to day boundaries. */
	onRangeChange?: (range: [Date, Date]) => void;
	/** `bar` sizes each day by `count`; `dot` renders uniform circles. Default `bar`. */
	variant?: "bar" | "dot";
	/** Label in the top-left corner. Default `Activity Timeline`. */
	title?: string;
}

// ============================================================================
// Period configuration
// ============================================================================

const PERIOD_OPTIONS: {value: TimelinePeriod; label: string}[] = [
	{value: "all", label: "All time"},
	{value: "1y", label: "1 Year"},
	{value: "3m", label: "3 Months"},
	{value: "1m", label: "1 Month"},
];

const PERIOD_LABEL: Record<TimelinePeriod, string> = {
	all: "All time",
	"1y": "1 Year",
	"3m": "3 Months",
	"1m": "1 Month",
};

/** Trailing window start for a period relative to the latest date, or `null` for `all`. */
function windowStart(period: TimelinePeriod, latest: Date): Date | null {
	switch (period) {
		case "1m":
			return subMonths(latest, 1);
		case "3m":
			return subMonths(latest, 3);
		case "1y":
			return subYears(latest, 1);
		default:
			return null;
	}
}

function clampIndex(index: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, index));
}

// ============================================================================
// Component
// ============================================================================

/** A compact, embeddable timeline that selects a date range via draggable handles over a day strip. */
const TimelineRangeSelector = React.forwardRef<HTMLDivElement, TimelineRangeSelectorProps>(
	(
		{
			className,
			data,
			period = "3m",
			onPeriodChange,
			selectedRange,
			onRangeChange,
			variant = "bar",
			title = "Activity Timeline",
			...props
		},
		ref,
	) => {
		const trackRef = React.useRef<HTMLDivElement | null>(null);
		const [dragging, setDragging] = React.useState<"start" | "end" | null>(null);

		// Days that fall inside the active period window, sorted chronologically.
		const days = React.useMemo(() => {
			const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
			if (sorted.length === 0) {
				return sorted;
			}
			const latest = sorted[sorted.length - 1].date;
			const start = windowStart(period, latest);
			if (!start) {
				return sorted;
			}
			return sorted.filter((d) => !isBefore(d.date, start));
		}, [data, period]);

		const maxCount = React.useMemo(() => Math.max(1, ...days.map((d) => d.count ?? 0)), [days]);

		// Resolve the selected range to day indices. Defaults to the full visible window; clamps to it.
		const [startIndex, endIndex] = React.useMemo<[number, number]>(() => {
			const last = days.length - 1;
			if (last < 0) {
				return [0, 0];
			}
			if (!selectedRange) {
				return [0, last];
			}
			const [rStart, rEnd] = selectedRange;
			let si = 0;
			let ei = last;
			for (let i = 0; i < days.length; i++) {
				if (!isBefore(days[i].date, rStart)) {
					si = i;
					break;
				}
			}
			for (let i = last; i >= 0; i--) {
				if (!isAfter(days[i].date, rEnd)) {
					ei = i;
					break;
				}
			}
			return [clampIndex(si, 0, last), clampIndex(Math.max(si, ei), 0, last)];
		}, [days, selectedRange]);

		const emitRange = React.useCallback(
			(si: number, ei: number) => {
				if (days.length === 0 || !onRangeChange) {
					return;
				}
				onRangeChange([days[si].date, days[ei].date]);
			},
			[days, onRangeChange],
		);

		// Map a client X within the track to the day whose cell (and dot) sits under the pointer.
		// Each day owns an equal 1/count-wide cell, so flooring the ratio lands on that day's dot.
		const indexAtClientX = React.useCallback(
			(clientX: number): number => {
				const track = trackRef.current;
				if (!track || days.length === 0) {
					return 0;
				}
				const rect = track.getBoundingClientRect();
				const ratio = (clientX - rect.left) / rect.width;
				return clampIndex(Math.floor(ratio * days.length), 0, days.length - 1);
			},
			[days.length],
		);

		React.useEffect(() => {
			if (!dragging) {
				return;
			}
			const onMove = (event: PointerEvent) => {
				const idx = indexAtClientX(event.clientX);
				if (dragging === "start") {
					emitRange(Math.min(idx, endIndex), endIndex);
				} else {
					emitRange(startIndex, Math.max(idx, startIndex));
				}
			};
			const onUp = () => setDragging(null);
			window.addEventListener("pointermove", onMove);
			window.addEventListener("pointerup", onUp);
			return () => {
				window.removeEventListener("pointermove", onMove);
				window.removeEventListener("pointerup", onUp);
			};
		}, [dragging, indexAtClientX, emitRange, startIndex, endIndex]);

		const count = days.length;
		// Handles sit on the center of each day's cell — where the dot/bar is drawn — so they
		// always land on a mark rather than in the gap between marks. Day i is centered at
		// (i + 0.5) / count across the track.
		const startPct = count > 0 ? ((startIndex + 0.5) / count) * 100 : 0;
		const endPct = count > 0 ? ((endIndex + 0.5) / count) * 100 : 100;

		const axisLabels = React.useMemo(() => {
			if (count === 0) {
				return null;
			}
			const mid = Math.floor((count - 1) / 2);
			return {
				start: format(days[0].date, "MMM d"),
				middle: format(days[mid].date, "MMM d"),
				end: format(days[count - 1].date, "MMM d"),
			};
		}, [days, count]);

		const isDot = variant === "dot";

		return (
			<div
				ref={ref}
				className={cn("wwc:flex wwc:w-full wwc:flex-col wwc:gap-3 wwc:px-3 wwc:py-2", className)}
				{...props}
			>
				{/* Header: title + period dropdown */}
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
					<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">{title}</span>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:outline-none"
							>
								{PERIOD_LABEL[period]}
								<ChevronDown className="wwc:size-3.5 wwc:opacity-60" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{PERIOD_OPTIONS.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onSelect={() => onPeriodChange?.(option.value)}
									className={period === option.value ? "wwc:font-semibold" : undefined}
								>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Timeline track */}
				<div
					ref={trackRef}
					className="wwc:relative wwc:h-8 wwc:w-full wwc:touch-none wwc:select-none"
					data-variant={variant}
				>
					{/* Selection shade */}
					{count > 0 && (
						<div
							className="wwc:pointer-events-none wwc:absolute wwc:inset-y-0 wwc:z-0 wwc:rounded-sm wwc:bg-primary/10"
							style={{left: `${startPct}%`, right: `${100 - endPct}%`}}
						/>
					)}

					{/* Day marks */}
					<div
						className={cn("wwc:absolute wwc:inset-0 wwc:z-10 wwc:flex", isDot ? "wwc:items-center" : "wwc:items-end")}
					>
						{days.map((day, i) => {
							const active = i >= startIndex && i <= endIndex;
							if (isDot) {
								return (
									<div
										key={day.date.getTime()}
										className="wwc:flex wwc:flex-1 wwc:items-center wwc:justify-center wwc:px-px"
									>
										<span
											className={cn(
												"wwc:h-1.5 wwc:w-full wwc:max-w-1.5 wwc:rounded-sm",
												active ? "wwc:bg-primary" : "wwc:bg-muted-foreground/30",
											)}
										/>
									</div>
								);
							}
							const heightPct = Math.max(8, ((day.count ?? 0) / maxCount) * 100);
							return (
								<div
									key={day.date.getTime()}
									className="wwc:flex wwc:h-full wwc:flex-1 wwc:items-end wwc:justify-center wwc:px-px"
								>
									<span
										className={cn(
											"wwc:w-full wwc:max-w-1.5 wwc:rounded-t-sm",
											active ? "wwc:bg-primary" : "wwc:bg-muted-foreground/25",
										)}
										style={{height: `${heightPct}%`}}
									/>
								</div>
							);
						})}
					</div>

					{/* Handles */}
					{count > 0 && (
						<>
							<Handle
								position={startPct}
								variant={variant}
								date={days[startIndex].date}
								valueNow={startIndex}
								valueMax={count - 1}
								onPointerDown={() => setDragging("start")}
								dragging={dragging === "start"}
								side="start"
							/>
							<Handle
								position={endPct}
								variant={variant}
								date={days[endIndex].date}
								valueNow={endIndex}
								valueMax={count - 1}
								onPointerDown={() => setDragging("end")}
								dragging={dragging === "end"}
								side="end"
							/>
						</>
					)}
				</div>

				{/* X-axis labels */}
				{axisLabels && (
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-[10px] wwc:text-muted-foreground">
						<span>{axisLabels.start}</span>
						<span>{axisLabels.middle}</span>
						<span>{axisLabels.end}</span>
					</div>
				)}
			</div>
		);
	},
);
TimelineRangeSelector.displayName = "TimelineRangeSelector";

// ============================================================================
// Handle
// ============================================================================

interface HandleProps {
	position: number;
	variant: "bar" | "dot";
	date: Date;
	valueNow: number;
	valueMax: number;
	dragging: boolean;
	side: "start" | "end";
	onPointerDown: () => void;
}

function Handle({position, variant, date, valueNow, valueMax, dragging, side, onPointerDown}: HandleProps) {
	return (
		<div
			role="slider"
			aria-label={side === "start" ? "Range start" : "Range end"}
			aria-valuemin={0}
			aria-valuemax={valueMax}
			aria-valuenow={valueNow}
			aria-valuetext={format(date, "MMM d, yyyy")}
			tabIndex={0}
			onPointerDown={(event) => {
				event.preventDefault();
				onPointerDown();
			}}
			className={cn(
				"wwc:absolute wwc:inset-y-0 wwc:z-20 wwc:flex wwc:-translate-x-1/2 wwc:cursor-col-resize wwc:items-center wwc:justify-center wwc:focus-visible:outline-none",
			)}
			style={{left: `${position}%`}}
		>
			{/* Dot variant shows a date tooltip pill above the edge */}
			{variant === "dot" && (
				<span className="wwc:absolute wwc:-top-1 wwc:rounded wwc:bg-foreground wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-background wwc:whitespace-nowrap">
					{format(date, "MMM d")}
				</span>
			)}
			<span
				className={cn(
					"wwc:rounded-full wwc:bg-primary",
					variant === "dot" ? "wwc:h-full wwc:w-0.5" : "wwc:h-full wwc:w-1",
					dragging ? "wwc:ring-2 wwc:ring-primary/40" : undefined,
				)}
			/>
		</div>
	);
}

export {TimelineRangeSelector};
