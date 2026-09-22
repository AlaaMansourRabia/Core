import {cn} from "@corensystem/core-utils";
import {TrendingDown, TrendingUp} from "lucide-react";
import * as React from "react";

/** One source in the comparison (e.g. Approved / Planned, actual / baseline). */
export interface CompareBarsSource {
	/** Legend label, e.g. "Approved". */
	label: string;
	/** Percentage 0–100. */
	value: number;
}

export interface CompareBarsProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Left / primary source, rendered dark — most commonly the actual / approved value. */
	primary: CompareBarsSource;
	/** Right / secondary source, rendered lighter — most commonly the planned / baseline value. */
	secondary: CompareBarsSource;
	/** Variance shown in the pill. Defaults to `primary.value - secondary.value`. */
	variance?: number;
	/** Density. `compact` (default) matches the ProgressComparison panel; `default` is a touch larger. */
	size?: "compact" | "default";
}

interface Sz {
	gap: string;
	hero: string;
	pill: string;
	pillText: string;
	pillIcon: string;
	legendText: string;
	legendDot: string;
	barGap: string;
	bar: string;
}

const SIZES: Record<"compact" | "default", Sz> = {
	compact: {
		gap: "wwc:gap-2",
		hero: "wwc:text-xl",
		pill: "wwc:gap-0.5 wwc:rounded wwc:px-1.5 wwc:py-0.5",
		pillText: "wwc:text-[11px]",
		pillIcon: "wwc:size-3",
		legendText: "wwc:text-[10px]",
		legendDot: "wwc:size-1.5",
		barGap: "wwc:gap-0.5",
		bar: "wwc:h-2",
	},
	default: {
		gap: "wwc:gap-2.5",
		hero: "wwc:text-2xl",
		pill: "wwc:gap-0.5 wwc:rounded wwc:px-2 wwc:py-0.5",
		pillText: "wwc:text-xs",
		pillIcon: "wwc:size-3.5",
		legendText: "wwc:text-xs",
		legendDot: "wwc:size-2",
		barGap: "wwc:gap-1",
		bar: "wwc:h-2.5",
	},
};

/**
 * The dual-bar comparison primitive: two hero percentages (primary vs secondary) with a variance pill
 * between them, a two-item legend, and a pair of stacked progress bars. This is the presentational core
 * shared by the `ProgressComparison` widget — use it directly when you just need the bars block without
 * the surrounding card/stats/header.
 */
const CompareBars = React.forwardRef<HTMLDivElement, CompareBarsProps>(
	({className, primary, secondary, variance, size = "compact", ...props}, ref) => {
		const sz = SIZES[size];
		const delta = variance ?? primary.value - secondary.value;
		const negative = delta < 0;
		const positive = delta > 0;
		const TrendIcon = negative ? TrendingDown : TrendingUp;
		const clamp = (v: number) => Math.min(100, Math.max(0, v));
		return (
			<div ref={ref} className={cn("wwc:flex wwc:flex-col", sz.gap, className)} {...props}>
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
					<span className={cn("wwc:font-bold wwc:leading-none wwc:text-foreground", sz.hero)}>{primary.value}%</span>
					<div
						className={cn(
							"wwc:flex wwc:items-center",
							sz.pill,
							negative
								? "wwc:bg-destructive/10 wwc:text-destructive"
								: positive
									? "wwc:bg-emerald-50 wwc:text-emerald-600"
									: "wwc:bg-muted wwc:text-muted-foreground",
						)}
					>
						<TrendIcon className={sz.pillIcon} />
						<span className={cn("wwc:font-semibold", sz.pillText)}>
							{delta > 0 ? "+" : ""}
							{delta}%
						</span>
						<span className={sz.pillText}>variance</span>
					</div>
					<span className={cn("wwc:font-bold wwc:leading-none wwc:text-zinc-500", sz.hero)}>{secondary.value}%</span>
				</div>

				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div className="wwc:flex wwc:items-center wwc:gap-1.5">
						<span className={cn("wwc:rounded-sm wwc:bg-primary", sz.legendDot)} />
						<span className={cn("wwc:text-foreground", sz.legendText)}>{primary.label}</span>
					</div>
					<div className="wwc:flex wwc:items-center wwc:gap-1.5">
						<span className={cn("wwc:rounded-sm wwc:bg-zinc-500", sz.legendDot)} />
						<span className={cn("wwc:text-zinc-500", sz.legendText)}>{secondary.label}</span>
					</div>
				</div>

				<div className={cn("wwc:flex wwc:flex-col", sz.barGap)}>
					<div className={cn("wwc:w-full wwc:overflow-hidden wwc:rounded-sm wwc:bg-muted", sz.bar)}>
						<div className="wwc:h-full wwc:rounded-sm wwc:bg-primary" style={{width: `${clamp(primary.value)}%`}} />
					</div>
					<div className={cn("wwc:w-full wwc:overflow-hidden wwc:rounded-sm wwc:bg-muted", sz.bar)}>
						<div
							className="wwc:h-full wwc:rounded-sm wwc:bg-zinc-500/40"
							style={{width: `${clamp(secondary.value)}%`}}
						/>
					</div>
				</div>
			</div>
		);
	},
);
CompareBars.displayName = "CompareBars";

export {CompareBars};
