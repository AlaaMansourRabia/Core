import {cn} from "@corensystem/core-utils";
import {format} from "date-fns";
import {Calendar as CalendarIcon, ChevronLeft, ChevronRight} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Calendar} from "./calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {Tabs, TabsList, TabsTrigger} from "./tabs";

/** One week shown as a segmented tab. */
export interface WeekSelectorWeek {
	/** Unique value for the tab, e.g. "W112". */
	value: string;
	/** Tab label. Defaults to `value`. */
	label?: string;
	/** Week start date — drives the date-range label when this week is selected. */
	start: Date;
	/** Week end date. */
	end: Date;
}

export interface WeekSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
	/** The full list of weeks. The tabs show a window of these, centered on the selected week. */
	weeks: WeekSelectorWeek[];
	/** Selected week value (controlled). */
	value?: string;
	/** Initial selected week value (uncontrolled). Defaults to the latest (last) week. */
	defaultValue?: string;
	/** Fires when the selected week changes (tab click, chevron, or calendar). */
	onValueChange?: (value: string) => void;
	/** Number of week tabs shown at once, centered on the selection (clamped at the ends). Default 4. */
	visibleCount?: number;
	/** Fires when a date is chosen from the calendar popover (opened by clicking the date label). */
	onDateSelect?: (date: Date) => void;
	/** Override the date-range label. Defaults to the selected week's start–end range. */
	dateLabel?: React.ReactNode;
	/**
	 * Render bare: drop the default outer container (rounded corners, border, card background, and
	 * padding) so the control sits flush inside a toolbar/app bar. The inner layout — date-range
	 * label, chevrons, and week tabs — is unchanged. Default false.
	 */
	bare?: boolean;
}

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (value: T) => void) {
	const [internal, setInternal] = React.useState<T>(fallback);
	const value = controlled !== undefined ? controlled : internal;
	const set = React.useCallback(
		(next: T) => {
			if (controlled === undefined) setInternal(next);
			onChange?.(next);
		},
		[controlled, onChange],
	);
	return [value, set] as const;
}

/**
 * A compact week selector: a clickable date-range label that opens a calendar to jump to any week,
 * previous / next chevrons that step the selected week (keeping it centered in the visible tabs), and
 * a segmented row of week tabs (built on the shared `Tabs` component). Controlled or uncontrolled via
 * `value` / `defaultValue`.
 */
const WeekSelector = React.forwardRef<HTMLDivElement, WeekSelectorProps>(
	(
		{
			className,
			weeks,
			value,
			defaultValue,
			onValueChange,
			visibleCount = 4,
			onDateSelect,
			dateLabel,
			bare = false,
			...props
		},
		ref,
	) => {
		// Default to the latest (last) week — the most recent available.
		const latestValue = weeks[weeks.length - 1]?.value;
		const [selected, setSelected] = useControllable(value, defaultValue ?? latestValue, onValueChange);
		const [open, setOpen] = React.useState(false);

		const selectedIndex = Math.max(
			0,
			weeks.findIndex((w) => w.value === selected),
		);
		const current = weeks[selectedIndex];

		// A window of `visibleCount` tabs centered on the selection, clamped to the list's bounds.
		const half = Math.floor(visibleCount / 2);
		const start = Math.max(0, Math.min(selectedIndex - half, Math.max(0, weeks.length - visibleCount)));
		const visible = weeks.slice(start, start + visibleCount);

		const canPrev = selectedIndex > 0;
		const canNext = selectedIndex < weeks.length - 1;

		const rangeLabel =
			dateLabel ??
			(current ? `${format(current.start, "MMM d, yyyy")} – ${format(current.end, "MMM d, yyyy")}` : "Select a week");

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:inline-flex wwc:items-center wwc:gap-1",
					// The outer container chrome — dropped in `bare` mode so the control sits flush in a toolbar.
					!bare && "wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:px-3 wwc:py-2",
					className,
				)}
				{...props}
			>
				{/* Clickable date range → calendar popover */}
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1 wwc:rounded-md wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
						>
							<CalendarIcon className="wwc:size-4" />
							<span>{rangeLabel}</span>
						</button>
					</PopoverTrigger>
					<PopoverContent className="wwc:w-auto wwc:p-0" align="start">
						<Calendar
							mode="single"
							selected={current?.start}
							defaultMonth={current?.start}
							onSelect={(date) => {
								if (date) {
									onDateSelect?.(date);
									setOpen(false);
								}
							}}
							initialFocus
						/>
					</PopoverContent>
				</Popover>

				{/* Chevrons step the selected week; the tabs re-center on it */}
				<Button
					variant="ghost"
					icon
					size="sm"
					aria-label="Previous week"
					disabled={!canPrev}
					onClick={() => canPrev && setSelected(weeks[selectedIndex - 1].value)}
				>
					<ChevronLeft className="wwc:size-5" />
				</Button>

				<Tabs value={selected} onValueChange={setSelected}>
					<TabsList>
						{visible.map((week) => (
							<TabsTrigger key={week.value} value={week.value}>
								{week.label ?? week.value}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>

				<Button
					variant="ghost"
					icon
					size="sm"
					aria-label="Next week"
					disabled={!canNext}
					onClick={() => canNext && setSelected(weeks[selectedIndex + 1].value)}
				>
					<ChevronRight className="wwc:size-5" />
				</Button>
			</div>
		);
	},
);
WeekSelector.displayName = "WeekSelector";

export {WeekSelector};
