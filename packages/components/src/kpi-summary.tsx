import {cn} from "@core/core-utils";
import * as React from "react";

import {MetricCard, type MetricCardProps} from "./metric-card";

/** One metric in a KPISummary — the same contract as a MetricCard tile. */
export type KpiMetric = MetricCardProps;

export interface KPISummaryProps {
	/** Metrics to display — one MetricCard tile per entry. */
	metrics: KpiMetric[];
	/** Columns at the lg breakpoint (responsive: 1 column on mobile, 2 at md). Default 4. */
	columns?: 2 | 3 | 4;
	/**
	 * Optional bespoke tile(s) rendered as the LAST grid cell(s), after the metric tiles — for a tile
	 * that exceeds MetricCard's contract (e.g. a multi-badge severity breakdown). Each child occupies one
	 * grid cell alongside the MetricCards, so the row stays uniform.
	 */
	children?: React.ReactNode;
	className?: string;
}

const columnClass: Record<2 | 3 | 4, string> = {
	2: "wwc:md:grid-cols-2",
	3: "wwc:md:grid-cols-2 wwc:lg:grid-cols-3",
	4: "wwc:md:grid-cols-2 wwc:lg:grid-cols-4",
};

/** A responsive grid of MetricCard tiles (plus optional bespoke trailing tiles) — the reusable KPI
 * summary band above a dashboard or list. */
const KPISummary = React.forwardRef<HTMLDivElement, KPISummaryProps>(
	({metrics, columns = 4, children, className}, ref) => (
		<div ref={ref} className={cn("wwc:grid wwc:gap-4", columnClass[columns], className)}>
			{metrics.map((metric, i) => (
				<MetricCard key={i} {...metric} />
			))}
			{children}
		</div>
	),
);
KPISummary.displayName = "KPISummary";

export {KPISummary};
