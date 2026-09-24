import type {EChartsOption} from "echarts";

import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {ChartContainer} from "./chart";

export type ScoreGaugeTone = "success" | "warning" | "danger" | "primary";

const TONE_ARC: Record<ScoreGaugeTone, string> = {
	success: "#16a34a",
	warning: "#f59e0b",
	danger: "#dc2626",
	primary: "#3b82f6",
};

const TONE_TEXT: Record<ScoreGaugeTone, string> = {
	success: "wwc:text-green-600",
	warning: "wwc:text-amber-600",
	danger: "wwc:text-red-600",
	primary: "wwc:text-primary",
};

export interface ScoreGaugeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	/** The score to plot. Clamped to `0..max`. */
	value: number;
	/** Top of the scale. Defaults to 100. */
	max?: number;
	/** Colour of the filled arc and the score figure. */
	tone?: ScoreGaugeTone;
	/** Diameter in px. Defaults to 120. */
	size?: number;
	/** Caption under the score. Defaults to `/ {max}`; pass `null` to hide. */
	caption?: React.ReactNode;
}

/**
 * Radial score dial — a ring whose filled arc is the score, with the figure centred inside it.
 * Use for a single headline index (health score, readiness, compliance), not for a distribution:
 * a donut of several categories is a pie chart, and belongs in a `TrendChart`.
 */
const ScoreGauge = React.forwardRef<HTMLDivElement, ScoreGaugeProps>(
	({value, max = 100, tone = "primary", size = 120, caption, className, ...props}, ref) => {
		const clamped = Math.min(Math.max(value, 0), max);

		const option = React.useMemo<EChartsOption>(
			() => ({
				series: [
					{
						type: "pie",
						radius: ["78%", "100%"],
						center: ["50%", "50%"],
						silent: true,
						label: {show: false},
						labelLine: {show: false},
						data: [
							{value: clamped, itemStyle: {color: TONE_ARC[tone]}},
							{value: max - clamped, itemStyle: {color: "#e5e7eb"}},
						],
					},
				],
			}),
			[clamped, max, tone],
		);

		return (
			<div
				ref={ref}
				className={cn("wwc:relative wwc:shrink-0", className)}
				style={{height: size, width: size}}
				// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a canvas dial, not a bitmap
				role="img"
				aria-label={`${clamped} out of ${max}`}
				{...props}
			>
				<ChartContainer option={option} height={size} />
				<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center">
					<span className={cn("wwc:text-2xl wwc:font-semibold", TONE_TEXT[tone])}>{clamped}</span>
					{caption !== null && <span className="wwc:text-xs wwc:text-muted-foreground">{caption ?? `/ ${max}`}</span>}
				</div>
			</div>
		);
	},
);
ScoreGauge.displayName = "ScoreGauge";

export {ScoreGauge};
