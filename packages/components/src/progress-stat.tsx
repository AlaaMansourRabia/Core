import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {Progress, type ProgressTone} from "./progress";

const TONE_DOT: Record<ProgressTone, string> = {
	primary: "wwc:bg-primary",
	success: "wwc:bg-green-500",
	warning: "wwc:bg-amber-500",
	danger: "wwc:bg-red-500",
};

const TONE_VALUE: Record<ProgressTone, string> = {
	primary: "wwc:text-primary",
	success: "wwc:text-green-600",
	warning: "wwc:text-amber-600",
	danger: "wwc:text-red-600",
};

export interface ProgressStatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Metric name, shown beside a tone-coloured dot. */
	title: React.ReactNode;
	/** Headline figure. Usually the same number as `percent`. */
	value: React.ReactNode;
	/** Suffix after the value, e.g. `%`. */
	unit?: React.ReactNode;
	/** Muted line under the value (e.g. "567 overdue"). */
	caption?: React.ReactNode;
	/** Bar fill, 0–100. Omit to hide the bar. */
	percent?: number;
	/** Drives the dot, the figure, and the bar — one tone per stat. */
	tone?: ProgressTone;
}

/**
 * A single metric tile with a completion bar: dot + label, headline figure, caption, and a
 * `Progress` bar underneath. Use for "how far along is this dimension" breakdowns, where each
 * tile is one facet of a score. For a bare figure with a trend arrow, use `MetricCard` instead.
 */
const ProgressStat = React.forwardRef<HTMLDivElement, ProgressStatProps>(
	({title, value, unit, caption, percent, tone = "primary", className, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:rounded-lg wwc:border wwc:p-4", className)} {...props}>
			<p className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm wwc:font-medium">
				<span className={cn("wwc:h-2 wwc:w-2 wwc:shrink-0 wwc:rounded-full", TONE_DOT[tone])} />
				{title}
			</p>
			<p className={cn("wwc:mt-1 wwc:text-2xl wwc:font-semibold", TONE_VALUE[tone])}>
				{value}
				{unit && <span className="wwc:ml-0.5 wwc:text-sm wwc:font-normal">{unit}</span>}
			</p>
			{caption && <p className="wwc:text-xs wwc:text-muted-foreground">{caption}</p>}
			{percent !== undefined && <Progress value={percent} tone={tone} className="wwc:mt-2 wwc:h-1.5" />}
		</div>
	),
);
ProgressStat.displayName = "ProgressStat";

export {ProgressStat};
