import {cn} from "@wakecap/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {Calendar, ChevronLeft, ChevronRight, Play} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

const DAY_MS = 86_400_000;

/** Project schedule bounds the week-stepper pages through. */
export interface ScheduleMeta {
	/** ISO date (YYYY-MM-DD) of the project's first day. */
	projectStart: string;
	/** Total number of days in the schedule. */
	totalDays: number;
}

const DEFAULT_META: ScheduleMeta = {projectStart: "2026-06-01", totalDays: 180};

function dayMs(iso: string, offsetDays = 0): number {
	return Date.parse(`${iso}T00:00:00Z`) + offsetDays * DAY_MS;
}

function weekLabel(startMs: number): string {
	const fmt = new Intl.DateTimeFormat("en-US", {month: "short", day: "numeric", timeZone: "UTC"});
	return `${fmt.format(new Date(startMs))} – ${fmt.format(new Date(startMs + 6 * DAY_MS))}`;
}

const scheduleWeekBarVariants = cva(
	"wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:rounded wwc:border wwc:p-2 wwc:text-sm",
	{
		variants: {
			variant: {
				/** Translucent frosted panel that floats over 3D / map content. */
				frosted: "wwc:border-border/50 wwc:bg-background/80 wwc:shadow-lg wwc:backdrop-blur-lg",
				/** Solid bordered surface for use inside a toolbar or panel. */
				plain: "wwc:border-border wwc:bg-card",
			},
		},
		defaultVariants: {
			variant: "frosted",
		},
	},
);

export interface ScheduleWeekBarProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPlay">, VariantProps<typeof scheduleWeekBarVariants> {
	/** Schedule bounds the stepper pages through. Defaults to a 180-day project. */
	meta?: ScheduleMeta;
	/** Called with the zero-based project day of the visible week's start when Play is pressed. */
	onPlay?: (day: number) => void;
}

/** A compact week stepper with prev / next paging and a 4D-timeline play trigger. */
const ScheduleWeekBar = React.forwardRef<HTMLDivElement, ScheduleWeekBarProps>(
	({className, variant, meta = DEFAULT_META, onPlay, ...props}, ref) => {
		const [weekIndex, setWeekIndex] = React.useState(0);
		const initialized = React.useRef(false);

		const maxWeek = React.useMemo(() => Math.max(0, Math.floor((meta.totalDays - 1) / 7)), [meta.totalDays]);

		// Default to the week containing today, clamped to the schedule.
		React.useEffect(() => {
			if (initialized.current) return;
			initialized.current = true;
			const todayDay = Math.floor((dayMs(new Date().toISOString().slice(0, 10)) - dayMs(meta.projectStart)) / DAY_MS);
			setWeekIndex(Math.max(0, Math.min(maxWeek, Math.floor(todayDay / 7))));
		}, [meta.projectStart, maxWeek]);

		const weekStartDay = weekIndex * 7;
		const label = weekLabel(dayMs(meta.projectStart, weekStartDay));

		return (
			<div ref={ref} className={cn(scheduleWeekBarVariants({variant}), className)} {...props}>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1">
					<Calendar className="wwc:size-3.5 wwc:shrink-0 wwc:text-muted-foreground" aria-hidden="true" />
					<span className="wwc:font-semibold wwc:tabular-nums wwc:text-foreground">{label}</span>
				</div>
				<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:justify-between wwc:gap-0.5 wwc:px-2">
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label="Previous week"
						disabled={weekIndex <= 0}
						onClick={() => setWeekIndex((w) => Math.max(0, w - 1))}
						className="wwc:size-6 wwc:text-muted-foreground wwc:hover:text-foreground"
					>
						<ChevronLeft className="wwc:size-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label={`Play 4D timeline from ${label}`}
						onClick={() => onPlay?.(weekStartDay)}
						className="wwc:size-6 wwc:text-muted-foreground wwc:hover:text-foreground"
					>
						<Play className="wwc:size-4 wwc:fill-current" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label="Next week"
						disabled={weekIndex >= maxWeek}
						onClick={() => setWeekIndex((w) => Math.min(maxWeek, w + 1))}
						className="wwc:size-6 wwc:text-muted-foreground wwc:hover:text-foreground"
					>
						<ChevronRight className="wwc:size-4" />
					</Button>
				</div>
			</div>
		);
	},
);
ScheduleWeekBar.displayName = "ScheduleWeekBar";

export {ScheduleWeekBar, scheduleWeekBarVariants};
