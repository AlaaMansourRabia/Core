import type {EChartsOption} from "echarts";

import * as React from "react";

import {ChartContainer, type ChartSeriesTheme} from "./chart";
import {WidgetCard, WidgetCardActions, WidgetCardBody, WidgetCardHeader, WidgetCardTitle} from "./widget-card";

export interface TrendChartProps {
	/** Title shown in the grey header band. */
	title?: React.ReactNode;
	/** Right-aligned header slot (info icon, menu, range toggle, ...). */
	actions?: React.ReactNode;
	/** Headline figure rendered above the chart (e.g. the period total). */
	value?: React.ReactNode;
	/** Optional extra content rendered under the value (e.g. a custom legend). */
	header?: React.ReactNode;
	/** ECharts option for the chart (series / axes / tooltip / ...). */
	option: EChartsOption;
	/** Core semantic tones or chart palette indexes applied to series in order. */
	seriesThemes?: ChartSeriesTheme[];
	/** Chart height in px (or any CSS size). Default 240. */
	height?: number | string;
	className?: string;
}

/** A titled card wrapping a themed ECharts trend/analysis chart (line / bar) — the reusable chart tile
 * in an analytics report. Composes the Chart (ChartContainer) primitive for theming + instance handling
 * and the WidgetCard shell for its grey header band. */
const TrendChart = React.forwardRef<HTMLDivElement, TrendChartProps>(
	({title, actions, value, header, option, seriesThemes, height = 240, className}, ref) => {
		return (
			<WidgetCard
				ref={ref}
				className={className}
				data-core-artifact="trend-chart"
				data-core-surface-owner="artifact"
			>
				{(title || actions) && (
					<WidgetCardHeader>
						{title ? <WidgetCardTitle>{title}</WidgetCardTitle> : <span />}
						{actions && <WidgetCardActions>{actions}</WidgetCardActions>}
					</WidgetCardHeader>
				)}
				<WidgetCardBody>
					{value !== undefined && <div className="wwc:text-3xl wwc:font-semibold wwc:tracking-tight">{value}</div>}
					{header}
					<ChartContainer option={option} seriesThemes={seriesThemes} height={height} />
				</WidgetCardBody>
			</WidgetCard>
		);
	},
);
TrendChart.displayName = "TrendChart";

export {TrendChart};
