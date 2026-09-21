import ReactECharts from "echarts-for-react";
import {useMemo} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {getChartColors, getCssVarAsRgb} from "@/lib/utils";

const chartData = [
	{month: "Jan", desktop: 186, mobile: 80},
	{month: "Feb", desktop: 305, mobile: 200},
	{month: "Mar", desktop: 237, mobile: 120},
	{month: "Apr", desktop: 73, mobile: 190},
	{month: "May", desktop: 209, mobile: 130},
	{month: "Jun", desktop: 214, mobile: 140},
];

export function ChartPage() {
	const colors = useMemo(() => getChartColors(), []);
	const textColor = useMemo(() => getCssVarAsRgb("--foreground"), []);
	const borderColor = useMemo(() => getCssVarAsRgb("--border"), []);

	const barChartOption = useMemo(
		() => ({
			tooltip: {
				trigger: "axis",
				axisPointer: {type: "shadow"},
			},
			legend: {
				data: ["Desktop", "Mobile"],
				textStyle: {color: textColor},
				bottom: 0,
				left: "center",
			},
			grid: {
				left: "3%",
				right: "4%",
				bottom: "15%",
				containLabel: true,
			},
			xAxis: {
				type: "category",
				data: chartData.map((d) => d.month),
				axisLine: {lineStyle: {color: borderColor}},
				axisLabel: {color: textColor},
			},
			yAxis: {
				type: "value",
				axisLine: {lineStyle: {color: borderColor}},
				axisLabel: {color: textColor},
				splitLine: {lineStyle: {color: borderColor, type: "dashed"}},
			},
			series: [
				{
					name: "Desktop",
					type: "bar",
					data: chartData.map((d) => d.desktop),
					itemStyle: {color: colors[0]},
					emphasis: {itemStyle: {color: colors[0]}},
				},
				{
					name: "Mobile",
					type: "bar",
					data: chartData.map((d) => d.mobile),
					itemStyle: {color: colors[1]},
					emphasis: {itemStyle: {color: colors[1]}},
				},
			],
		}),
		[colors, textColor, borderColor],
	);

	const lineChartOption = useMemo(
		() => ({
			tooltip: {
				trigger: "axis",
			},
			legend: {
				data: ["Desktop", "Mobile"],
				textStyle: {color: textColor},
				bottom: 0,
				left: "center",
			},
			grid: {
				left: "3%",
				right: "4%",
				bottom: "15%",
				containLabel: true,
			},
			xAxis: {
				type: "category",
				data: chartData.map((d) => d.month),
				axisLine: {lineStyle: {color: borderColor}},
				axisLabel: {color: textColor},
			},
			yAxis: {
				type: "value",
				axisLine: {lineStyle: {color: borderColor}},
				axisLabel: {color: textColor},
				splitLine: {lineStyle: {color: borderColor, type: "dashed"}},
			},
			series: [
				{
					name: "Desktop",
					type: "line",
					data: chartData.map((d) => d.desktop),
					smooth: true,
					showSymbol: false,
					lineStyle: {color: colors[0], width: 2},
					itemStyle: {color: colors[0]},
				},
				{
					name: "Mobile",
					type: "line",
					data: chartData.map((d) => d.mobile),
					smooth: true,
					showSymbol: false,
					lineStyle: {color: colors[1], width: 2},
					itemStyle: {color: colors[1]},
				},
			],
		}),
		[colors, textColor, borderColor],
	);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Chart</h1>
					<CopyButton
						value="Chart"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Beautiful charts built using ECharts with theme support.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Bar Chart</CardTitle>
						<CopyButton
							value="Chart - Bar Chart"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Showing total visitors for the last 6 months</CardDescription>
				</CardHeader>
				<CardContent>
					<ReactECharts option={barChartOption} style={{height: 300}} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Line Chart</CardTitle>
						<CopyButton
							value="Chart - Line Chart"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Showing total visitors for the last 6 months</CardDescription>
				</CardHeader>
				<CardContent>
					<ReactECharts option={lineChartOption} style={{height: 300}} />
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Chart - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>ECharts wrapper components and hooks.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Export</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										name: "ChartContainer",
										type: "Component",
										desc: "Wrapper around ReactECharts that accepts an ECharts option object and integrates with the design system theme.",
									},
									{
										name: "ChartConfig",
										type: "Type",
										desc: "Configuration type mapping data keys to labels, colors, and icons.",
									},
									{
										name: "useChartTheme()",
										type: "Hook",
										desc: "Returns theme-aware colors (colors[], textColor, mutedColor, borderColor, backgroundColor) derived from CSS variables.",
									},
								].map((row) => (
									<tr key={row.name} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.name}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Chart - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "config",
										type: "ChartConfig",
										def: "—",
										desc: "Chart configuration mapping data keys to labels, colors, and icons.",
									},
									{
										prop: "option",
										type: "Record<string, unknown>",
										def: "—",
										desc: "ECharts option object defining the chart configuration.",
									},
									{
										prop: "hideLabel",
										type: "boolean",
										def: "false",
										desc: "Hide the tooltip label (ChartTooltipContent).",
									},
									{
										prop: "hideIndicator",
										type: "boolean",
										def: "false",
										desc: "Hide the color indicator (ChartTooltipContent).",
									},
									{
										prop: "indicator",
										type: '"line" | "dot" | "dashed"',
										def: '"dot"',
										desc: "Tooltip indicator style (ChartTooltipContent).",
									},
									{prop: "nameKey", type: "string", def: "—", desc: "Key to use for item names in tooltip/legend."},
									{prop: "labelKey", type: "string", def: "—", desc: "Key to use for the tooltip label."},
									{
										prop: "hideIcon",
										type: "boolean",
										def: "false",
										desc: "Hide icons in the legend (ChartLegendContent).",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Chart - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import ReactECharts from "echarts-for-react"
import { useChartTheme } from "@/components/ui/chart"

function MyChart() {
  const { colors, textColor, borderColor } = useChartTheme()

  const option = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed"],
      axisLabel: { color: textColor },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: borderColor, type: "dashed" } },
    },
    series: [
      {
        type: "bar",
        data: [120, 200, 150],
        itemStyle: { color: colors[0] },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: 300 }} />
}`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
