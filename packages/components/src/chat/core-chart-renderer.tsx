import ReactECharts from "echarts-for-react";

import type {ChartData} from "../types/chat";

// Core Chart Colors (orange/amber palette from theme)
// These correspond to --chart-1 through --chart-5 in oklch format
const CHART_COLORS = {
	chart1: "#f5d4a8", // oklch(0.92 0.07 75) - lightest amber
	chart2: "#e8b573", // oklch(0.85 0.12 70) - light amber
	chart3: "#d99447", // oklch(0.78 0.17 65) - medium amber/orange
	chart4: "#c97a24", // oklch(0.71 0.22 60) - dark amber/orange
	chart5: "#b86010", // oklch(0.64 0.27 55) - darkest burnt orange
};

const CHART_COLOR_LIST = Object.values(CHART_COLORS);

// Tooltip style matching Core design system
const tooltipConfig = {
	trigger: "axis" as const,
	backgroundColor: "hsl(var(--background))",
	borderColor: "hsl(var(--border))",
	borderWidth: 1,
	textStyle: {
		fontSize: 12,
	},
};

const tooltipConfigItem = {
	...tooltipConfig,
	trigger: "item" as const,
};

interface ChartRendererProps {
	chartData: ChartData;
	height?: number;
	className?: string;
}

export function ChartRenderer({chartData, height = 220, className = ""}: ChartRendererProps) {
	const {chartType, data, xAxisKey, dataKeys = [], stacked} = chartData;

	const getColor = (_key: string, index: number): string => {
		return CHART_COLOR_LIST[index % CHART_COLOR_LIST.length];
	};

	const baseGrid = {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10,
		containLabel: true,
	};

	const baseXAxis = {
		type: "category" as const,
		data: data.map((d) => String(d[xAxisKey!])),
		axisLabel: {fontSize: 10},
		axisLine: {show: false},
		axisTick: {show: false},
	};

	const baseYAxis = {
		type: "value" as const,
		axisLabel: {fontSize: 10},
		axisLine: {show: false},
		axisTick: {show: false},
		splitLine: {
			lineStyle: {type: "dashed" as const},
		},
	};

	const buildOption = (): echarts.EChartsOption | null => {
		switch (chartType) {
			case "line":
				return {
					grid: baseGrid,
					xAxis: baseXAxis,
					yAxis: baseYAxis,
					tooltip: tooltipConfig,
					series: dataKeys.map((key, index) => ({
						name: key,
						type: "line" as const,
						smooth: true,
						data: data.map((d) => Number(d[key])),
						lineStyle: {color: getColor(key, index), width: 2},
						itemStyle: {color: getColor(key, index)},
						symbolSize: 6,
					})),
				};

			case "bar":
				return {
					grid: baseGrid,
					xAxis: baseXAxis,
					yAxis: baseYAxis,
					tooltip: tooltipConfig,
					series: dataKeys.map((key, index) => ({
						name: key,
						type: "bar" as const,
						data: data.map((d) => Number(d[key])),
						itemStyle: {
							color: getColor(key, index),
							borderRadius: [2, 2, 0, 0],
						},
						stack: stacked ? "stack" : undefined,
					})),
				};

			case "area":
				return {
					grid: baseGrid,
					xAxis: baseXAxis,
					yAxis: baseYAxis,
					tooltip: tooltipConfig,
					series: dataKeys.map((key, index) => ({
						name: key,
						type: "line" as const,
						smooth: true,
						data: data.map((d) => Number(d[key])),
						lineStyle: {color: getColor(key, index), width: 2},
						itemStyle: {color: getColor(key, index)},
						areaStyle: {
							color: {
								type: "linear",
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [
									{offset: 0, color: getColor(key, index) + "4D"}, // ~0.3 opacity
									{offset: 1, color: getColor(key, index) + "00"}, // 0 opacity
								],
							},
						},
						stack: stacked ? "stack" : undefined,
					})),
				};

			case "pie":
				return {
					tooltip: tooltipConfigItem,
					series: [
						{
							type: "pie" as const,
							radius: ["36%", "64%"],
							center: ["50%", "50%"],
							padAngle: 2,
							data: data.map((d, index) => ({
								name: String(d.name),
								value: Number(d.value),
								itemStyle: {
									color: CHART_COLOR_LIST[index % CHART_COLOR_LIST.length],
								},
							})),
						},
					],
				};

			case "scatter":
				return {
					grid: baseGrid,
					xAxis: {
						type: "value" as const,
						name: xAxisKey,
						axisLabel: {fontSize: 10},
						axisLine: {show: false},
						axisTick: {show: false},
						splitLine: {
							lineStyle: {type: "dashed" as const},
						},
					},
					yAxis: {
						type: "value" as const,
						name: dataKeys[0],
						axisLabel: {fontSize: 10},
						axisLine: {show: false},
						axisTick: {show: false},
						splitLine: {
							lineStyle: {type: "dashed" as const},
						},
					},
					tooltip: tooltipConfigItem,
					series: [
						{
							type: "scatter" as const,
							data: data.map((d) => [Number(d[xAxisKey!]), Number(d[dataKeys[0]])]),
							itemStyle: {color: CHART_COLORS.chart3},
						},
					],
				};

			default:
				return null;
		}
	};

	const option = buildOption();

	if (!option) {
		return null;
	}

	return (
		<div className={`wwc:w-full ${className}`}>
			<ReactECharts option={option} style={{height}} />
		</div>
	);
}
