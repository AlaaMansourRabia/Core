import {cn} from "@wakecap/core-utils";
import {format} from "date-fns";
import {ChevronDown} from "lucide-react";
import * as React from "react";

import {Calendar} from "./calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {ScrollArea} from "./scroll-area";

/** A single captured timestamp. */
export interface TimestampEntry {
	/** The full timestamp (date + time) of the capture. */
	time: Date;
}

export interface TimestampPickerProps {
	/** All available captured timestamps across every date. */
	entries: TimestampEntry[];
	/** The currently selected timestamp. */
	value?: Date;
	/** Called with the selected timestamp when the user picks a time. */
	onChange?: (value: Date) => void;
	/** Placeholder shown in the trigger when nothing is selected. */
	placeholder?: string;
	/** Reduces the size of the trigger, calendar, and time list for dense layouts. */
	compact?: boolean;
	className?: string;
	disabled?: boolean;
}

const dotStyle = `
.wkc-ts-cal .wkc-ts-dot::after {
	content: "";
	position: absolute;
	bottom: 3px;
	left: 50%;
	transform: translateX(-50%);
	width: 5px;
	height: 5px;
	border-radius: 9999px;
	background: var(--primary);
	pointer-events: none;
}
.wkc-ts-cal .wkc-ts-dot:has(.selected)::after {
	background: var(--primary-foreground);
}
`;

let dotStyleInjected = false;
function injectDotStyle() {
	if (dotStyleInjected || typeof document === "undefined") return;
	const s = document.createElement("style");
	s.textContent = dotStyle;
	document.head.appendChild(s);
	dotStyleInjected = true;
}

function dayKey(d: Date): string {
	return format(d, "yyyy-MM-dd");
}

/**
 * A pill-shaped selector for choosing a captured timestamp. Clicking the pill opens a
 * calendar where dates with captured data are marked with a dot (dates without data are
 * disabled). Selecting a date reveals a scrollable list of the times captured on that day.
 */
function TimestampPicker({
	entries,
	value,
	onChange,
	placeholder = "Select a timestamp",
	compact = false,
	className,
	disabled = false,
}: TimestampPickerProps) {
	injectDotStyle();

	const [open, setOpen] = React.useState(false);

	// Group entries by day and remember the keys that have data.
	const {entriesByDay, entryDayKeys} = React.useMemo(() => {
		const byDay = new Map<string, TimestampEntry[]>();
		for (const entry of entries) {
			const key = dayKey(entry.time);
			const list = byDay.get(key);
			if (list) {
				list.push(entry);
			} else {
				byDay.set(key, [entry]);
			}
		}
		// Keep each day's times in chronological order.
		for (const list of byDay.values()) {
			list.sort((a, b) => a.time.getTime() - b.time.getTime());
		}
		return {entriesByDay: byDay, entryDayKeys: new Set(byDay.keys())};
	}, [entries]);

	// Which day's time list is currently shown in the popover.
	const [activeDay, setActiveDay] = React.useState<Date | undefined>(value);
	React.useEffect(() => {
		if (value) setActiveDay(value);
	}, [value]);

	const hasEntry = React.useCallback((d: Date) => entryDayKeys.has(dayKey(d)), [entryDayKeys]);

	const activeTimes = activeDay ? (entriesByDay.get(dayKey(activeDay)) ?? []) : [];

	const defaultMonth = value ?? entries.at(-1)?.time;

	const handleSelectTime = (time: Date) => {
		onChange?.(time);
		setOpen(false);
	};

	const primaryLabel = value ? format(value, "MMM d, yyyy, h:mm a") : placeholder;

	// The single most recent capture across every day. When it's the selected value,
	// the trigger flags it with a "Latest" badge.
	const latestTime = React.useMemo(
		() => entries.reduce((max, entry) => Math.max(max, entry.time.getTime()), Number.NEGATIVE_INFINITY),
		[entries],
	);
	const isLatestSelected = value != null && value.getTime() === latestTime;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={cn(
						"wwc:flex wwc:items-center wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card",
						"wwc:text-left wwc:shadow-sm wwc:transition-colors",
						compact ? "wwc:gap-2 wwc:py-1.5 wwc:pl-3 wwc:pr-2" : "wwc:gap-3 wwc:py-2 wwc:pl-4 wwc:pr-3",
						"wwc:hover:bg-accent/50 wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring",
						"wwc:disabled:pointer-events-none wwc:disabled:opacity-50",
						className,
					)}
				>
					<span
						className={cn(
							"wwc:truncate wwc:text-sm wwc:font-semibold wwc:leading-tight",
							!value && "wwc:font-normal wwc:text-muted-foreground",
						)}
					>
						{primaryLabel}
					</span>
					{isLatestSelected && (
						<span className="wwc:inline-flex wwc:shrink-0 wwc:items-center wwc:rounded-md wwc:bg-blue-600 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-white">
							Latest
						</span>
					)}
					<ChevronDown
						className={cn(
							"wwc:ml-auto wwc:shrink-0 wwc:text-muted-foreground",
							compact ? "wwc:size-3.5" : "wwc:size-4",
						)}
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-auto wwc:p-0" align="start">
				<Calendar
					className="wkc-ts-cal"
					size={compact ? "compact" : "default"}
					mode="single"
					defaultMonth={defaultMonth}
					selected={activeDay}
					onSelect={(day) => {
						if (day) setActiveDay(day);
					}}
					disabled={(day) => !hasEntry(day)}
					modifiers={{hasEntries: hasEntry}}
					modifiersClassNames={{hasEntries: "wkc-ts-dot"}}
					initialFocus
				/>
				{/* Inset divider — aligns with the content padding instead of running full-bleed. */}
				<div className={cn("wwc:mt-1 wwc:border-t wwc:border-border", compact ? "wwc:mx-2" : "wwc:mx-3")} />
				<div>
					<div
						className={cn(
							"wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground",
							compact ? "wwc:px-4 wwc:pt-3 wwc:pb-1.5" : "wwc:px-3 wwc:pt-4 wwc:pb-2",
						)}
					>
						{activeDay ? format(activeDay, "EEEE, MMM d") : "Select a date"}
					</div>
					<ScrollArea className={cn("wwc:pb-2", compact ? "wwc:px-2 wwc:h-40" : "wwc:px-3 wwc:h-48")}>
						{activeTimes.length > 0 ? (
							<div className="wwc:flex wwc:flex-col wwc:gap-1">
								{activeTimes.map((entry) => {
									const isSelected = value?.getTime() === entry.time.getTime();
									return (
										<button
											key={entry.time.getTime()}
											type="button"
											onClick={() => handleSelectTime(entry.time)}
											className={cn(
												"wwc:rounded-md wwc:text-left wwc:text-sm wwc:font-medium wwc:transition-colors",
												compact ? "wwc:px-2 wwc:py-1.5" : "wwc:px-3 wwc:py-2",
												"wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:bg-accent",
												isSelected && "wwc:bg-primary wwc:text-primary-foreground wwc:hover:bg-primary",
											)}
										>
											{format(entry.time, "h:mm a")}
										</button>
									);
								})}
							</div>
						) : (
							<div
								className={cn(
									"wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:py-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground",
									compact ? "wwc:px-2" : "wwc:px-3",
								)}
							>
								{activeDay ? "No captures on this date." : "Pick a highlighted date to see its captures."}
							</div>
						)}
					</ScrollArea>
				</div>
			</PopoverContent>
		</Popover>
	);
}
TimestampPicker.displayName = "TimestampPicker";

export {TimestampPicker};
