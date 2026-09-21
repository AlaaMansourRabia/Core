import type {EChartsOption} from "echarts";

import ReactECharts from "echarts-for-react";
import {
	Activity,
	CheckCircle2,
	Clock,
	DollarSign,
	FileWarning,
	Shield,
	Target,
	TrendingDown,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import {useMemo} from "react";

import {Badge} from "../badge";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {ChartRenderer} from "../chat/core-chart-renderer";
import {MetricCard} from "../metric-card";
import {CoreFilterStrip} from "../navigation/core-filter-strip";
import {Progress} from "../progress";
import {ScrollArea} from "../scroll-area";
import {TrendChart} from "../trend-chart";
import type {Organization} from "../types";
import type {DashboardWidget} from "../types/chat";

interface OrgPerformanceProps {
	selectedOrg: Organization;
	addedWidgets?: DashboardWidget[];
}

// Core Chart Colors (orange/amber palette from theme)
// These correspond to --chart-1 through --chart-5 in oklch format
const CHART_COLORS = {
	chart1: "#f5d4a8", // oklch(0.92 0.07 75) - lightest amber
	chart2: "#e8b573", // oklch(0.85 0.12 70) - light amber
	chart3: "#d99447", // oklch(0.78 0.17 65) - medium amber/orange
	chart4: "#c97a24", // oklch(0.71 0.22 60) - dark amber/orange
	chart5: "#b86010", // oklch(0.64 0.27 55) - darkest burnt orange
};

// Portfolio metrics data
const portfolioMetrics = {
	totalWorkforce: 6140,
	activeZones: 47,
	totalZones: 52,
	equipmentOnline: 234,
	equipmentTotal: 245,
	tasksCompleted: 1847,
	tasksTarget: 1640,
	spi: 0.94,
	cpi: 0.91,
	safetyScore: 96.4,
	productivityIndex: 108,
	ltiFreeDay: 127,
	openNCRs: 14,
	daysToCompletion: 167,
	forecastSAR: 2.8,
};

// Project status data
const projectStatusData = [
	{name: "Six Flags", progress: 78, spi: 1.02, cpi: 1.05, status: "on-track"},
	{name: "Aquarabia", progress: 65, spi: 0.98, cpi: 0.94, status: "at-risk"},
	{name: "Gaming District", progress: 42, spi: 0.85, cpi: 0.78, status: "critical"},
	{name: "Speed Park", progress: 89, spi: 1.08, cpi: 1.12, status: "on-track"},
	{name: "Stadium", progress: 72, spi: 1.01, cpi: 0.92, status: "at-risk"},
	{name: "Golf Course", progress: 35, spi: 0.72, cpi: 0.65, status: "critical"},
	{name: "Mercedes-AMG", progress: 58, spi: 0.89, cpi: 0.91, status: "at-risk"},
	{name: "Arts Centre", progress: 81, spi: 1.04, cpi: 1.08, status: "on-track"},
	{name: "Studios", progress: 52, spi: 1.0, cpi: 1.03, status: "on-track"},
];

// Cost burn data
const costBurnData = [
	{month: "Aug", baseline: 145, actual: 142, forecast: null},
	{month: "Sep", baseline: 170, actual: 178, forecast: null},
	{month: "Oct", baseline: 195, actual: 210, forecast: null},
	{month: "Nov", baseline: 220, actual: 245, forecast: null},
	{month: "Dec", baseline: 250, actual: 285, forecast: null},
	{month: "Jan", baseline: 280, actual: 320, forecast: 320},
	{month: "Feb", baseline: 310, actual: null, forecast: 358},
	{month: "Mar", baseline: 340, actual: null, forecast: 395},
];

// Workforce distribution
const workforceByTrade = [
	{name: "Civil", value: 1850},
	{name: "Structural", value: 1420},
	{name: "MEP", value: 1180},
	{name: "Finishing", value: 980},
	{name: "Other", value: 710},
];

// Safety incidents weekly
const safetyWeeklyData = [
	{week: "W1", incidents: 3, nearMiss: 8},
	{week: "W2", incidents: 2, nearMiss: 12},
	{week: "W3", incidents: 4, nearMiss: 6},
	{week: "W4", incidents: 1, nearMiss: 9},
	{week: "W5", incidents: 2, nearMiss: 7},
	{week: "W6", incidents: 0, nearMiss: 5},
];

// Headcount data (monthly)
const headcountData = [
	{month: "Jan 25", expected: 506, actual: 259},
	{month: "Feb 25", expected: 532, actual: 382},
	{month: "Mar 25", expected: 466, actual: 342},
	{month: "Apr 25", expected: 462, actual: 324},
	{month: "May 25", expected: 453, actual: 315},
	{month: "Jun 25", expected: 677, actual: 367},
	{month: "Jul 25", expected: 749, actual: 494},
	{month: "Aug 25", expected: 721, actual: 496},
	{month: "Sep 25", expected: 828, actual: 529},
	{month: "Oct 25", expected: 655, actual: 553},
	{month: "Nov 25", expected: 642, actual: 521},
	{month: "Dec 25", expected: 603, actual: 473},
	{month: "Jan 26", expected: 585, actual: 421},
];

// Undelivered hours data (monthly)
const undeliveredHoursData = [
	{month: "Jan 25", expected: 80, active: 31, undeliveredPct: 32},
	{month: "Feb 25", expected: 92, active: 21, undeliveredPct: 25},
	{month: "Mar 25", expected: 69, active: 37, undeliveredPct: 38},
	{month: "Apr 25", expected: 84, active: 56, undeliveredPct: 34},
	{month: "May 25", expected: 82, active: 55, undeliveredPct: 33},
	{month: "Jun 25", expected: 95, active: 58, undeliveredPct: 40},
	{month: "Jul 25", expected: 133, active: 74, undeliveredPct: 45},
	{month: "Aug 25", expected: 129, active: 69, undeliveredPct: 47},
	{month: "Sep 25", expected: 138, active: 73, undeliveredPct: 47},
	{month: "Oct 25", expected: 144, active: 72, undeliveredPct: 50},
	{month: "Nov 25", expected: 135, active: 64, undeliveredPct: 53},
	{month: "Dec 25", expected: 127, active: 56, undeliveredPct: 56},
	{month: "Jan 26", expected: 127, active: 59, undeliveredPct: 50},
];

// Workforce activity data (monthly - percentage based)
const workforceActivityData = [
	{month: "Jan 25", active: 87.39, inactive: 12.61},
	{month: "Feb 25", active: 83.89, inactive: 16.11},
	{month: "Mar 25", active: 83.58, inactive: 16.42},
	{month: "Apr 25", active: 77.66, inactive: 22.34},
	{month: "May 25", active: 76.04, inactive: 23.96},
	{month: "Jun 25", active: 72.43, inactive: 27.57},
	{month: "Jul 25", active: 72.87, inactive: 27.13},
	{month: "Aug 25", active: 73.58, inactive: 26.42},
	{month: "Sep 25", active: 72.99, inactive: 27.01},
	{month: "Oct 25", active: 76.88, inactive: 23.12},
	{month: "Nov 25", active: 77.92, inactive: 22.08},
	{month: "Dec 25", active: 73.02, inactive: 26.98},
	{month: "Jan 26", active: 79.53, inactive: 20.47},
];

// Format large numbers to K format
function formatToK(value: number): string {
	if (value >= 1000) {
		return `${Math.round(value / 1000)}K`;
	}
	return value.toString();
}

function getStatusColor(status: string) {
	switch (status) {
		case "on-track":
			return "wwc:text-green-600";
		case "at-risk":
			return "wwc:text-amber-600";
		case "critical":
			return "wwc:text-red-600";
		default:
			return "wwc:text-muted-foreground";
	}
}

// Gauge Chart Component
function GaugeDisplay({value, target, label, color}: {value: number; target: number; label: string; color: string}) {
	const percentage = Math.min((value / target) * 100, 100);
	const isHealthy = value >= target * 0.95;

	return (
		<div className="wwc:flex wwc:flex-col wwc:items-center">
			<div className="wwc:relative wwc:h-24 wwc:w-24">
				<svg className="wwc:h-full wwc:w-full wwc:-rotate-90" viewBox="0 0 36 36">
					<path
						d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						className="text-muted"
					/>
					<path
						d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						fill="none"
						stroke={color}
						strokeWidth="3"
						strokeDasharray={`${percentage}, 100`}
						strokeLinecap="round"
					/>
				</svg>
				<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center">
					<span className={`wwc:text-xl wwc:font-bold ${isHealthy ? "wwc:text-foreground" : "wwc:text-amber-600"}`}>
						{value.toFixed(2)}
					</span>
				</div>
			</div>
			<span className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">{label}</span>
			<span className="wwc:text-[10px] wwc:text-muted-foreground">Target: {target.toFixed(2)}</span>
		</div>
	);
}

/** Organization-level performance metrics with SPI/CPI trends and progress charts. */
export function OrgPerformance({selectedOrg, addedWidgets = []}: OrgPerformanceProps) {
	const summaryStats = useMemo(() => {
		const onTrack = projectStatusData.filter((p) => p.status === "on-track").length;
		const atRisk = projectStatusData.filter((p) => p.status === "at-risk").length;
		const critical = projectStatusData.filter((p) => p.status === "critical").length;
		return {onTrack, atRisk, critical, total: projectStatusData.length};
	}, []);

	return (
		<div className="wwc:flex-1 wwc:overflow-auto wwc:bg-background">
			{/* Smart Filter Strip */}
			<CoreFilterStrip variant="performance" />

			<div className="wwc:p-6 wwc:space-y-6">
				{/* Header */}
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<h1 className="wwc:text-xl wwc:font-semibold wwc:text-foreground">Performance Command Center</h1>
						<p className="wwc:text-sm wwc:text-muted-foreground">Portfolio monitoring for {selectedOrg.name}</p>
					</div>
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<Badge variant="outline" className="wwc:gap-1.5">
							<span className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-green-500 wwc:animate-pulse" />
							Live
						</Badge>
						<span className="wwc:text-xs wwc:text-muted-foreground">Last updated: Just now</span>
					</div>
				</div>

				{/* Top KPI Row */}
				<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-3 wwc:lg:grid-cols-6 wwc:gap-4">
					<MetricCard
						title="Total Workforce"
						value={portfolioMetrics.totalWorkforce.toLocaleString()}
						trend="up"
						trendLabel="+142 today"
						icon={Users}
					/>
					<MetricCard
						title="Active Zones"
						value={portfolioMetrics.activeZones}
						unit={`/ ${portfolioMetrics.totalZones}`}
						icon={Target}
					/>
					<MetricCard
						title="Equipment Online"
						value={portfolioMetrics.equipmentOnline}
						unit={`/ ${portfolioMetrics.equipmentTotal}`}
						subtitle="98.2% availability"
						icon={Zap}
					/>
					<MetricCard
						title="Tasks Completed"
						value={portfolioMetrics.tasksCompleted.toLocaleString()}
						trend="up"
						trendLabel="+12.3% vs target"
						icon={CheckCircle2}
						status="success"
					/>
					<MetricCard
						title="Safety Score"
						value={portfolioMetrics.safetyScore}
						unit="%"
						trend="up"
						trendLabel="+0.4%"
						icon={Shield}
						status="success"
					/>
					<MetricCard
						title="Productivity"
						value={portfolioMetrics.productivityIndex}
						unit="%"
						trend="up"
						trendLabel="+8% vs baseline"
						icon={Activity}
						status="success"
					/>
				</div>

				{/* Charts Row 1: Headcount + Undelivered Hours */}
				<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-2 wwc:gap-4">
					{/* Headcount Chart */}
					<TrendChart
						title="Headcount"
						height={240}
						header={
							<div className="wwc:flex wwc:items-center wwc:justify-start wwc:gap-4 wwc:text-xs">
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span
										className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full"
										style={{backgroundColor: CHART_COLORS.chart1}}
									/>
									Average Expected Headcount
								</span>
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span
										className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full"
										style={{backgroundColor: CHART_COLORS.chart3}}
									/>
									Average Headcount
								</span>
							</div>
						}
						option={
							{
								tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
								grid: {top: 20, right: 20, bottom: 50, left: 40},
								xAxis: {
									type: "category",
									data: headcountData.map((d) => d.month),
									axisLabel: {fontSize: 10, rotate: 45},
									axisLine: {show: false},
									axisTick: {show: false},
								},
								yAxis: {
									type: "value",
									axisLabel: {fontSize: 10},
									axisLine: {show: false},
									axisTick: {show: false},
									splitLine: {lineStyle: {type: "dashed"}},
								},
								series: [
									{
										name: "Expected",
										type: "bar",
										data: headcountData.map((d) => d.expected),
										itemStyle: {color: CHART_COLORS.chart1, borderRadius: [2, 2, 0, 0]},
										barWidth: 16,
									},
									{
										name: "Actual",
										type: "bar",
										data: headcountData.map((d) => d.actual),
										itemStyle: {color: CHART_COLORS.chart3, borderRadius: [2, 2, 0, 0]},
										barWidth: 16,
									},
									{
										name: "Actual Trend",
										type: "line",
										data: headcountData.map((d) => d.actual),
										smooth: true,
										lineStyle: {width: 2, color: CHART_COLORS.chart5},
										itemStyle: {color: CHART_COLORS.chart5},
										symbol: "circle",
										symbolSize: 6,
									},
								],
							} as EChartsOption
						}
					/>

					{/* Undelivered Hours Chart */}
					<TrendChart
						title="Undelivered Hours"
						height={280}
						header={
							<div className="wwc:flex wwc:items-center wwc:justify-start wwc:gap-4 wwc:text-xs">
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span
										className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full"
										style={{backgroundColor: CHART_COLORS.chart1}}
									/>
									Expected Hours
								</span>
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span
										className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full"
										style={{backgroundColor: CHART_COLORS.chart3}}
									/>
									Hours Active
								</span>
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span
										className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full"
										style={{backgroundColor: CHART_COLORS.chart5}}
									/>
									Undelivered Hours %
								</span>
							</div>
						}
						option={
							{
								tooltip: {
									trigger: "axis",
									axisPointer: {type: "shadow"},
									formatter: (params: Array<{seriesName: string; value: number; marker: string}>) => {
										let result = `${(params[0] as unknown as {axisValue: string}).axisValue}<br/>`;
										for (const p of params) {
											if (p.seriesName === "Undelivered %") {
												result += `${p.marker} ${p.seriesName}: ${p.value}%<br/>`;
											} else {
												result += `${p.marker} ${p.seriesName}: ${formatToK(Number(p.value) * 1000)}<br/>`;
											}
										}
										return result;
									},
								},
								grid: {top: 30, right: 60, bottom: 50, left: 60},
								xAxis: {
									type: "category",
									data: undeliveredHoursData.map((d) => d.month),
									axisLabel: {fontSize: 10, rotate: 45},
									axisLine: {show: false},
									axisTick: {show: false},
								},
								yAxis: [
									{
										type: "value",
										name: "Hours",
										nameTextStyle: {fontSize: 11},
										axisLabel: {fontSize: 10, formatter: (v: number) => formatToK(v * 1000)},
										axisLine: {show: false},
										axisTick: {show: false},
										splitLine: {lineStyle: {type: "dashed"}},
									},
									{
										type: "value",
										name: "Undelivered Hours %",
										nameTextStyle: {fontSize: 11},
										min: 20,
										max: 60,
										axisLabel: {fontSize: 10, formatter: "{value}%"},
										axisLine: {show: false},
										axisTick: {show: false},
										splitLine: {show: false},
									},
								],
								series: [
									{
										name: "Expected",
										type: "bar",
										yAxisIndex: 0,
										data: undeliveredHoursData.map((d) => d.expected),
										itemStyle: {color: CHART_COLORS.chart1, borderRadius: [2, 2, 0, 0]},
										barWidth: 20,
										label: {
											show: true,
											position: "top",
											fontSize: 9,
											formatter: (p: {value: number}) => formatToK(Number(p.value) * 1000),
										},
									},
									{
										name: "Active",
										type: "bar",
										yAxisIndex: 0,
										data: undeliveredHoursData.map((d) => d.active),
										itemStyle: {color: CHART_COLORS.chart3, borderRadius: [2, 2, 0, 0]},
										barWidth: 20,
										label: {
											show: true,
											position: "top",
											fontSize: 9,
											formatter: (p: {value: number}) => formatToK(Number(p.value) * 1000),
										},
									},
									{
										name: "Undelivered %",
										type: "line",
										yAxisIndex: 1,
										data: undeliveredHoursData.map((d) => d.undeliveredPct),
										smooth: true,
										lineStyle: {width: 2, color: CHART_COLORS.chart5},
										itemStyle: {color: CHART_COLORS.chart5},
										symbol: "circle",
										symbolSize: 6,
										label: {show: true, position: "top", fontSize: 9, color: "#dc2626", formatter: "{c}%"},
									},
								],
							} as EChartsOption
						}
					/>
				</div>

				{/* Charts Row 2: Workforce Activity + Cost Burn */}
				<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-2 wwc:gap-4">
					{/* Present Workforce Activity Chart */}
					<TrendChart
						title="Present Workforce Activity (% of Total)"
						height={280}
						header={
							<div className="wwc:flex wwc:items-center wwc:justify-start wwc:gap-4 wwc:text-xs">
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span
										className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full"
										style={{backgroundColor: CHART_COLORS.chart3}}
									/>
									Hours Active
								</span>
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span
										className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full"
										style={{backgroundColor: CHART_COLORS.chart1}}
									/>
									Hours Inactive
								</span>
							</div>
						}
						option={
							{
								tooltip: {
									trigger: "axis",
									axisPointer: {type: "shadow"},
									formatter: (params: Array<{seriesName: string; value: number; marker: string}>) => {
										let result = `${(params[0] as unknown as {axisValue: string}).axisValue}<br/>`;
										for (const p of params) {
											result += `${p.marker} ${p.seriesName}: ${Number(p.value).toFixed(2)}%<br/>`;
										}
										return result;
									},
								},
								grid: {top: 20, right: 20, bottom: 50, left: 60},
								xAxis: {
									type: "category",
									data: workforceActivityData.map((d) => d.month),
									axisLabel: {fontSize: 10, rotate: 45},
									axisLine: {show: false},
									axisTick: {show: false},
								},
								yAxis: {
									type: "value",
									name: "Hours",
									nameTextStyle: {fontSize: 11},
									min: 0,
									max: 100,
									axisLabel: {fontSize: 10, formatter: "{value}%"},
									axisLine: {show: false},
									axisTick: {show: false},
									splitLine: {lineStyle: {type: "dashed"}},
								},
								series: [
									{
										name: "Active",
										type: "bar",
										stack: "total",
										data: workforceActivityData.map((d) => d.active),
										itemStyle: {color: CHART_COLORS.chart3},
										label: {
											show: true,
											position: "inside",
											fontSize: 9,
											formatter: (p: {value: number}) => `${Number(p.value).toFixed(2)}%`,
										},
									},
									{
										name: "Inactive",
										type: "bar",
										stack: "total",
										data: workforceActivityData.map((d) => d.inactive),
										itemStyle: {color: CHART_COLORS.chart1, borderRadius: [2, 2, 0, 0]},
										label: {
											show: true,
											position: "inside",
											fontSize: 9,
											formatter: (p: {value: number}) => `${Number(p.value).toFixed(2)}%`,
										},
										markLine: {
											silent: true,
											symbol: "none",
											lineStyle: {type: "dashed", color: "hsl(var(--muted-foreground))"},
											data: [{yAxis: 100}],
											label: {show: false},
										},
									},
								],
							} as EChartsOption
						}
					/>

					{/* Cost Burn Chart */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<CardTitle className="wwc:text-sm wwc:font-medium">Cost Burn vs Baseline</CardTitle>
								<span className="wwc:text-xs wwc:text-muted-foreground">SAR Millions</span>
							</div>
						</CardHeader>
						<CardContent>
							<ReactECharts
								option={{
									tooltip: {trigger: "axis"},
									grid: {top: 10, right: 10, bottom: 25, left: 40},
									xAxis: {
										type: "category",
										data: costBurnData.map((d) => d.month),
										axisLabel: {fontSize: 10},
										axisLine: {show: false},
										axisTick: {show: false},
									},
									yAxis: {
										type: "value",
										axisLabel: {fontSize: 10},
										axisLine: {show: false},
										axisTick: {show: false},
										splitLine: {lineStyle: {type: "dashed"}},
									},
									series: [
										{
											name: "Baseline",
											type: "line",
											data: costBurnData.map((d) => d.baseline),
											smooth: true,
											lineStyle: {width: 2, type: "dashed", color: "var(--muted-foreground)"},
											itemStyle: {color: "var(--muted-foreground)"},
											showSymbol: false,
										},
										{
											name: "Actual",
											type: "line",
											data: costBurnData.map((d) => d.actual),
											smooth: true,
											lineStyle: {width: 2, color: CHART_COLORS.chart2},
											itemStyle: {color: CHART_COLORS.chart2},
											areaStyle: {
												color: {
													type: "linear",
													x: 0,
													y: 0,
													x2: 0,
													y2: 1,
													colorStops: [
														{offset: 0, color: `${CHART_COLORS.chart2}4D`},
														{offset: 1, color: `${CHART_COLORS.chart2}00`},
													],
												},
											},
										},
										{
											name: "Forecast",
											type: "line",
											data: costBurnData.map((d) => d.forecast),
											smooth: true,
											lineStyle: {width: 2, type: "dashed", color: CHART_COLORS.chart5},
											itemStyle: {color: CHART_COLORS.chart5},
											areaStyle: {
												color: {
													type: "linear",
													x: 0,
													y: 0,
													x2: 0,
													y2: 1,
													colorStops: [
														{offset: 0, color: `${CHART_COLORS.chart5}4D`},
														{offset: 1, color: `${CHART_COLORS.chart5}00`},
													],
												},
											},
										},
									],
								}}
								style={{height: 200}}
							/>
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mt-2 wwc:pt-2 wwc:border-t">
								<div className="wwc:flex wwc:items-center wwc:gap-4 wwc:text-xs">
									<span className="wwc:flex wwc:items-center wwc:gap-1">
										<span className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-muted-foreground" />
										Baseline
									</span>
									<span className="wwc:flex wwc:items-center wwc:gap-1">
										<span className="wwc:h-2 wwc:w-2 wwc:rounded-full" style={{backgroundColor: CHART_COLORS.chart2}} />
										Actual
									</span>
									<span className="wwc:flex wwc:items-center wwc:gap-1">
										<span className="wwc:h-2 wwc:w-2 wwc:rounded-full" style={{backgroundColor: CHART_COLORS.chart5}} />
										Forecast
									</span>
								</div>
								<span className="wwc:text-sm wwc:font-semibold wwc:text-red-600">+SAR 40M (14.3%)</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Charts Row 3: Safety Incidents + Workforce by Trade */}
				<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-2 wwc:gap-4">
					{/* Safety Incidents */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div>
									<CardTitle className="wwc:text-sm wwc:font-medium">Safety Incidents</CardTitle>
									<p className="wwc:text-xs wwc:text-muted-foreground">Last 6 weeks</p>
								</div>
								<div className="wwc:text-right">
									<span className="wwc:text-2xl wwc:font-bold wwc:text-green-600">0</span>
									<p className="wwc:text-xs wwc:text-muted-foreground">This week</p>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<ReactECharts
								option={{
									tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
									grid: {top: 10, right: 10, bottom: 25, left: 30},
									xAxis: {
										type: "category",
										data: safetyWeeklyData.map((d) => d.week),
										axisLabel: {fontSize: 10},
										axisLine: {show: false},
										axisTick: {show: false},
									},
									yAxis: {
										type: "value",
										axisLabel: {fontSize: 10},
										axisLine: {show: false},
										axisTick: {show: false},
										splitLine: {lineStyle: {type: "dashed"}},
									},
									series: [
										{
											name: "Incidents",
											type: "bar",
											data: safetyWeeklyData.map((d) => d.incidents),
											itemStyle: {color: CHART_COLORS.chart5, borderRadius: [2, 2, 0, 0]},
										},
										{
											name: "Near Miss",
											type: "bar",
											data: safetyWeeklyData.map((d) => d.nearMiss),
											itemStyle: {color: CHART_COLORS.chart2, borderRadius: [2, 2, 0, 0]},
										},
									],
								}}
								style={{height: 200}}
							/>
							<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-4 wwc:mt-2 wwc:text-xs">
								<span className="wwc:flex wwc:items-center wwc:gap-1">
									<span className="wwc:h-2 wwc:w-2 wwc:rounded-full" style={{backgroundColor: CHART_COLORS.chart5}} />
									Incidents
								</span>
								<span className="wwc:flex wwc:items-center wwc:gap-1">
									<span className="wwc:h-2 wwc:w-2 wwc:rounded-full" style={{backgroundColor: CHART_COLORS.chart2}} />
									Near Miss
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Workforce Distribution */}
					<TrendChart
						title="Workforce by Trade"
						height={200}
						header={<p className="wwc:text-xs wwc:text-muted-foreground">Current distribution</p>}
						option={
							{
								tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
								grid: {top: 5, right: 15, bottom: 5, left: 70},
								xAxis: {
									type: "value",
									axisLabel: {fontSize: 10},
									axisLine: {show: false},
									axisTick: {show: false},
									splitLine: {lineStyle: {type: "dashed"}},
								},
								yAxis: {
									type: "category",
									data: workforceByTrade.map((d) => d.name),
									axisLabel: {fontSize: 11},
									axisLine: {show: false},
									axisTick: {show: false},
								},
								series: [
									{
										type: "bar",
										data: workforceByTrade.map((d, i) => ({
											value: d.value,
											itemStyle: {color: Object.values(CHART_COLORS)[i], borderRadius: [0, 4, 4, 0]},
										})),
									},
								],
							} as EChartsOption
						}
					/>
				</div>

				{/* Cards Row: Performance Indices + Project Progress + Quick Stats */}
				<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-2 wwc:lg:grid-cols-4 wwc:gap-4">
					{/* SPI & CPI Gauges */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-sm wwc:font-medium">Performance Indices</CardTitle>
						</CardHeader>
						<CardContent className="wwc:space-y-4">
							<div className="wwc:flex wwc:justify-around">
								<GaugeDisplay value={portfolioMetrics.spi} target={1.0} label="SPI" color={CHART_COLORS.chart2} />
								<GaugeDisplay value={portfolioMetrics.cpi} target={1.0} label="CPI" color={CHART_COLORS.chart4} />
							</div>
							<div className="wwc:space-y-2 wwc:pt-2 wwc:border-t">
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-xs">
									<span className="wwc:text-muted-foreground">Schedule Variance</span>
									<span className="wwc:font-medium wwc:text-amber-600">-6%</span>
								</div>
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-xs">
									<span className="wwc:text-muted-foreground">Cost Variance</span>
									<span className="wwc:font-medium wwc:text-red-600">-9%</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Project Status Bars */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<CardTitle className="wwc:text-sm wwc:font-medium">Project Progress</CardTitle>
								<div className="wwc:flex wwc:gap-2 wwc:text-xs">
									<span className="wwc:flex wwc:items-center wwc:gap-1">
										<span className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-green-500" />
										{summaryStats.onTrack}
									</span>
									<span className="wwc:flex wwc:items-center wwc:gap-1">
										<span className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-amber-500" />
										{summaryStats.atRisk}
									</span>
									<span className="wwc:flex wwc:items-center wwc:gap-1">
										<span className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-red-500" />
										{summaryStats.critical}
									</span>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<ScrollArea className="wwc:h-[200px] wwc:pr-4">
								<div className="wwc:space-y-3">
									{projectStatusData.map((project) => (
										<div key={project.name} className="wwc:space-y-1">
											<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-xs">
												<span className="wwc:text-foreground wwc:truncate wwc:max-w-[120px]">{project.name}</span>
												<span className={`wwc:font-medium ${getStatusColor(project.status)}`}>{project.progress}%</span>
											</div>
											<Progress
												value={project.progress}
												className={`wwc:h-1.5 ${
													project.status === "on-track"
														? "wwc:[&>div]:bg-green-500"
														: project.status === "at-risk"
															? "wwc:[&>div]:bg-amber-500"
															: "wwc:[&>div]:bg-red-500"
												}`}
											/>
										</div>
									))}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>

					{/* Quick Stats */}
					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:rounded-lg wwc:bg-muted wwc:p-2">
									<Clock className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<TrendingUp className="wwc:h-4 wwc:w-4 wwc:text-green-600" />
							</div>
							<div className="wwc:mt-2">
								<span className="wwc:text-2xl wwc:font-bold wwc:text-foreground">
									{portfolioMetrics.daysToCompletion}
								</span>
								<p className="wwc:text-xs wwc:text-muted-foreground">Days to Completion</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:rounded-lg wwc:bg-muted wwc:p-2">
									<DollarSign className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<TrendingDown className="wwc:h-4 wwc:w-4 wwc:text-red-600" />
							</div>
							<div className="wwc:mt-2">
								<span className="wwc:text-2xl wwc:font-bold wwc:text-foreground">{portfolioMetrics.forecastSAR}B</span>
								<p className="wwc:text-xs wwc:text-muted-foreground">SAR Forecast</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Additional Stats Row */}
				<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-4 wwc:gap-4">
					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:rounded-lg wwc:bg-muted wwc:p-2">
									<FileWarning className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<span className="wwc:text-xs wwc:text-red-600">+2</span>
							</div>
							<div className="wwc:mt-2">
								<span className="wwc:text-2xl wwc:font-bold wwc:text-red-600">{portfolioMetrics.openNCRs}</span>
								<p className="wwc:text-xs wwc:text-muted-foreground">Open NCRs</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:rounded-lg wwc:bg-muted wwc:p-2">
									<Shield className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<TrendingUp className="wwc:h-4 wwc:w-4 wwc:text-green-600" />
							</div>
							<div className="wwc:mt-2">
								<span className="wwc:text-2xl wwc:font-bold wwc:text-green-600">{portfolioMetrics.ltiFreeDay}</span>
								<p className="wwc:text-xs wwc:text-muted-foreground">LTI-Free Days</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* AI-Generated Charts - added at the tail */}
				{addedWidgets.length > 0 && (
					<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-2 wwc:gap-4">
						{addedWidgets.map((widget) => (
							<Card key={widget.id}>
								<CardHeader className="wwc:pb-2">
									<div className="wwc:flex wwc:items-center wwc:justify-between">
										<CardTitle className="wwc:text-sm wwc:font-medium">{widget.title}</CardTitle>
										<Badge variant="secondary" className="wwc:text-xs">
											AI Generated
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<ChartRenderer chartData={widget.chartData!} height={240} />
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Footer */}
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-xs wwc:text-muted-foreground wwc:pt-4 wwc:border-t">
					<span>Data sources: P6 (Schedule) • Unifier (Cost) • Core (Safety & Workforce)</span>
					<span>Auto-refresh: 30s</span>
				</div>
			</div>
		</div>
	);
}
