import {cn} from "@corensystem/core-utils";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameMonth,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import {ChevronLeft, ChevronRight, Plus} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

export type CalendarEventTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneBorderClass: Record<CalendarEventTone, string> = {
	neutral: "wwc:border-l-muted-foreground",
	primary: "wwc:border-l-primary",
	success: "wwc:border-l-emerald-500",
	warning: "wwc:border-l-amber-500",
	danger: "wwc:border-l-destructive",
	info: "wwc:border-l-sky-500",
};

export interface CalendarEvent {
	id: string;
	/** Date the event is anchored on. */
	date: Date;
	/** Optional short identifier rendered before the title (e.g. "ASMOB-11"). */
	identifier?: string;
	/** Event title. */
	title: string;
	/** Visual tone — drives the left border color. Defaults to "neutral". */
	tone?: CalendarEventTone;
}

export interface CalendarViewProps {
	/** Controls which month is visible. Pair with onMonthChange. */
	month?: Date;
	/** Initial month for uncontrolled use. Defaults to today's month. */
	defaultMonth?: Date;
	/** Fires when the user navigates to a new month via the prev / next / Today buttons. */
	onMonthChange?: (month: Date) => void;

	/** Day to highlight as "today". Defaults to new Date(). */
	today?: Date;

	/** Day-of-week the grid starts on. Defaults to Monday (1). */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

	events?: CalendarEvent[];

	/** Fires when an empty area inside a day cell is clicked. */
	onDayClick?: (date: Date) => void;
	/** Fires when an event chip is clicked. */
	onEventClick?: (event: CalendarEvent) => void;
	/**
	 * When set, an "+ Add work item" affordance appears in each cell on hover.
	 * Receives the date the action was triggered on.
	 */
	onAddItem?: (date: Date) => void;
	/** Label for the add-item affordance. Defaults to "Add work item". */
	addItemLabel?: string;

	/**
	 * Slot rendered on the right side of the header (next to "Today"). Use for
	 * an Options dropdown, view-mode switcher, etc.
	 */
	headerActions?: React.ReactNode;

	className?: string;
}

function CalendarEventChip({event, onClick}: {event: CalendarEvent; onClick?: (event: CalendarEvent) => void}) {
	const tone = event.tone ?? "neutral";
	const interactive = !!onClick;
	return (
		<button
			type="button"
			onClick={
				interactive
					? (e) => {
							e.stopPropagation();
							onClick(event);
						}
					: undefined
			}
			className={cn(
				"wwc:flex wwc:w-full wwc:items-center wwc:gap-1.5 wwc:rounded wwc:border wwc:border-border wwc:border-l-[3px] wwc:bg-card wwc:px-1.5 wwc:py-1 wwc:text-left wwc:text-xs wwc:leading-tight wwc:text-foreground",
				interactive && "wwc:hover:bg-accent/50 wwc:transition-colors",
				toneBorderClass[tone],
			)}
		>
			{event.identifier && <span className="wwc:font-medium wwc:text-muted-foreground">{event.identifier}</span>}
			<span className="wwc:truncate">{event.title}</span>
		</button>
	);
}

export function CalendarView({
	month,
	defaultMonth,
	onMonthChange,
	today = new Date(),
	weekStartsOn = 1,
	events = [],
	onDayClick,
	onEventClick,
	onAddItem,
	addItemLabel = "Add work item",
	headerActions,
	className,
}: CalendarViewProps) {
	const isControlled = month !== undefined;
	const [internalMonth, setInternalMonth] = React.useState<Date>(() => startOfMonth(defaultMonth ?? new Date()));
	const currentMonth = isControlled ? startOfMonth(month) : internalMonth;

	const setMonth = React.useCallback(
		(next: Date) => {
			const normalized = startOfMonth(next);
			if (!isControlled) setInternalMonth(normalized);
			onMonthChange?.(normalized);
		},
		[isControlled, onMonthChange],
	);

	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(currentMonth);
	const gridStart = startOfWeek(monthStart, {weekStartsOn});
	const gridEnd = endOfWeek(monthEnd, {weekStartsOn});
	const days = React.useMemo(() => eachDayOfInterval({start: gridStart, end: gridEnd}), [gridStart, gridEnd]);

	const weekdays = React.useMemo(() => {
		const start = gridStart;
		return Array.from({length: 7}, (_, i) => format(new Date(start.getTime() + i * 86400000), "EEE"));
	}, [gridStart]);

	const eventsByDay = React.useMemo(() => {
		const map = new Map<number, CalendarEvent[]>();
		for (const ev of events) {
			const key = startOfDay(ev.date).getTime();
			(map.get(key) || map.set(key, []).get(key)!).push(ev);
		}
		return map;
	}, [events]);

	const todayKey = startOfDay(today).getTime();

	return (
		<div className={cn("wwc:flex wwc:flex-col wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card", className)}>
			{/* Header */}
			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-4 wwc:py-3">
				<Button
					variant="ghost"
					icon
					className="wwc:h-7 wwc:w-7"
					onClick={() => setMonth(subMonths(currentMonth, 1))}
					aria-label="Previous month"
				>
					<ChevronLeft className="wwc:h-4 wwc:w-4" />
				</Button>
				<Button
					variant="ghost"
					icon
					className="wwc:h-7 wwc:w-7"
					onClick={() => setMonth(addMonths(currentMonth, 1))}
					aria-label="Next month"
				>
					<ChevronRight className="wwc:h-4 wwc:w-4" />
				</Button>
				<h2 className="wwc:ml-1 wwc:text-lg wwc:font-bold wwc:text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
				<div className="wwc:flex-1" />
				<Button variant="secondary" size="sm" className="wwc:h-7" onClick={() => setMonth(today)}>
					Today
				</Button>
				{headerActions}
			</div>

			{/* Weekday header */}
			<div
				style={{display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))"}}
				className="wwc:border-t wwc:border-border wwc:bg-muted/40"
			>
				{weekdays.map((d) => (
					<div
						key={d}
						className="wwc:border-r wwc:border-border wwc:px-3 wwc:py-2 wwc:text-sm wwc:text-muted-foreground last:wwc:border-r-0"
					>
						{d}
					</div>
				))}
			</div>

			{/* Day grid */}
			<div style={{display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gridAutoRows: "1fr"}}>
				{days.map((day) => {
					const inMonth = isSameMonth(day, currentMonth);
					const isToday = startOfDay(day).getTime() === todayKey;
					const isFirstOfMonth = day.getDate() === 1;
					const dayEvents = eventsByDay.get(startOfDay(day).getTime()) ?? [];
					const dayLabel = isFirstOfMonth ? format(day, "MMM d") : format(day, "d");
					return (
						<div
							key={day.toISOString()}
							role={onDayClick ? "button" : undefined}
							tabIndex={onDayClick ? 0 : undefined}
							onClick={onDayClick ? () => onDayClick(day) : undefined}
							style={{minHeight: "120px"}}
							className={cn(
								"wwc:group wwc:relative wwc:flex wwc:flex-col wwc:gap-1 wwc:border-r wwc:border-t wwc:border-border wwc:p-2 last:wwc:border-r-0",
								onDayClick && "wwc:cursor-pointer",
							)}
						>
							<div className="wwc:flex wwc:items-center wwc:justify-end">
								{isToday ? (
									<span
										className="wwc:flex wwc:h-6 wwc:min-w-6 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-primary wwc:px-1.5 wwc:text-xs wwc:font-semibold wwc:text-primary-foreground"
										aria-current="date"
									>
										{dayLabel}
									</span>
								) : (
									<span
										className={cn(
											"wwc:px-1 wwc:text-xs",
											inMonth ? "wwc:text-foreground" : "wwc:text-muted-foreground/60",
										)}
									>
										{dayLabel}
									</span>
								)}
							</div>

							<div className="wwc:flex wwc:flex-col wwc:gap-1">
								{dayEvents.map((ev) => (
									<CalendarEventChip key={ev.id} event={ev} onClick={onEventClick} />
								))}
								{onAddItem && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onAddItem(day);
										}}
										className="wwc:flex wwc:w-full wwc:items-center wwc:gap-1.5 wwc:rounded wwc:border wwc:border-border wwc:bg-card wwc:px-1.5 wwc:py-1 wwc:text-xs wwc:text-muted-foreground wwc:opacity-0 wwc:transition-opacity wwc:hover:bg-accent/40 wwc:hover:text-foreground wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
									>
										<Plus className="wwc:h-3 wwc:w-3" />
										{addItemLabel}
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
