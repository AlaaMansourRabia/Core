import {cn} from "@corensystem/core-utils";
import {ArrowDown, ArrowUp, Minus} from "lucide-react";
import * as React from "react";

import {WidgetCard, WidgetCardActions, WidgetCardBody, WidgetCardHeader, WidgetCardTitle} from "./widget-card";

export type MetricCardTrend = "up" | "down" | "stable";
export type MetricCardStatus = "success" | "warning" | "danger";

export interface MetricCardProps {
	/** Metric label shown above the value. */
	title: string;
	/** The metric value (pre-formatted by the caller). */
	value: string | number;
	/** Optional unit/suffix shown after the value (e.g. "%", "/ 12"). */
	unit?: string;
	/** Secondary line under the value. */
	subtitle?: string;
	/** Trend direction; renders a colored arrow. */
	trend?: MetricCardTrend;
	/** Text beside the trend arrow (e.g. "+12% vs target"). */
	trendLabel?: string;
	/** Leading icon (lucide or any component type). */
	icon?: React.ElementType;
	/** Status tone applied to the value. */
	status?: MetricCardStatus;
	className?: string;
}

const statusColors: Record<MetricCardStatus, string> = {
	success: "wwc:text-green-600",
	warning: "wwc:text-amber-600",
	danger: "wwc:text-red-600",
};

/** A single key-metric tile: label, value (+ unit), optional subtitle, trend, and leading icon. */
const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
	({title, value, unit, subtitle, trend, trendLabel, icon: Icon, status, className}, ref) => (
		<WidgetCard ref={ref} className={className}>
			<WidgetCardHeader>
				<WidgetCardTitle>{title}</WidgetCardTitle>
				{Icon && (
					<WidgetCardActions>
						<Icon className="wwc:h-4 wwc:w-4" />
					</WidgetCardActions>
				)}
			</WidgetCardHeader>
			<WidgetCardBody>
				<div className="wwc:flex wwc:items-start wwc:justify-between">
					<div className="wwc:space-y-1">
						<div className="wwc:flex wwc:items-baseline wwc:gap-1">
							<span className={cn("wwc:text-2xl wwc:font-bold", status ? statusColors[status] : "wwc:text-foreground")}>
								{value}
							</span>
							{unit && <span className="wwc:text-sm wwc:text-muted-foreground">{unit}</span>}
						</div>
						{subtitle && <p className="wwc:text-xs wwc:text-muted-foreground">{subtitle}</p>}
						{(trend || trendLabel) && (
							<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:pt-1">
								{trend === "up" && <ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />}
								{trend === "down" && <ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />}
								{trend === "stable" && <Minus className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />}
								{trendLabel && (
									<span
										className={cn(
											"wwc:text-xs",
											trend === "up"
												? "wwc:text-green-600"
												: trend === "down"
													? "wwc:text-red-600"
													: "wwc:text-muted-foreground",
										)}
									>
										{trendLabel}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</WidgetCardBody>
		</WidgetCard>
	),
);
MetricCard.displayName = "MetricCard";

export {MetricCard};
