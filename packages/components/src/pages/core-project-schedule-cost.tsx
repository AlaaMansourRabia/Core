import ReactECharts from "echarts-for-react";
import {AlertTriangle, ArrowRight, Calendar, Clock, DollarSign, Target, TrendingDown, TrendingUp} from "lucide-react";

import {Badge} from "../badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import type {Project} from "../types";

interface ProjectScheduleCostProps {
	project: Project;
}

// Mock schedule data
const scheduleActivities = [
	{id: "1", name: "Site Preparation", planned: 100, actual: 100, start: "Nov 1", end: "Dec 15", status: "complete"},
	{id: "2", name: "Foundation Works", planned: 100, actual: 85, start: "Dec 1", end: "Jan 30", status: "in-progress"},
	{id: "3", name: "Structural Steel", planned: 40, actual: 35, start: "Jan 15", end: "Mar 15", status: "in-progress"},
	{id: "4", name: "MEP Rough-in", planned: 0, actual: 0, start: "Feb 15", end: "Apr 30", status: "upcoming"},
	{id: "5", name: "Facade Installation", planned: 0, actual: 0, start: "Mar 1", end: "May 15", status: "upcoming"},
	{id: "6", name: "Interior Fit-out", planned: 0, actual: 0, start: "Apr 1", end: "Jun 30", status: "upcoming"},
];

// Mock cost data
const costTrendData = [
	{month: "Aug", planned: 12, actual: 11.5, forecast: null},
	{month: "Sep", planned: 24, actual: 23.8, forecast: null},
	{month: "Oct", planned: 38, actual: 39.2, forecast: null},
	{month: "Nov", planned: 52, actual: 54.1, forecast: null},
	{month: "Dec", planned: 68, actual: 71.2, forecast: null},
	{month: "Jan", planned: 85, actual: 82, forecast: 84},
	{month: "Feb", planned: 102, actual: null, forecast: 98},
	{month: "Mar", planned: 120, actual: null, forecast: 115},
];

const costBreakdown = [
	{category: "Labor", budget: 45, actual: 42.5, variance: 2.5},
	{category: "Materials", budget: 32, actual: 34.8, variance: -2.8},
	{category: "Equipment", budget: 12, actual: 11.2, variance: 0.8},
	{category: "Subcontractors", budget: 8, actual: 7.5, variance: 0.5},
	{category: "Overhead", budget: 3, actual: 3.2, variance: -0.2},
];

const criticalPathItems = [
	{name: "Foundation Pile Caps", days: 5, status: "at-risk"},
	{name: "Steel Column Erection", days: 12, status: "on-track"},
	{name: "Level 2 Deck Pour", days: 8, status: "on-track"},
	{name: "Mechanical Room Setup", days: 15, status: "upcoming"},
];

function getStatusColor(status: string) {
	switch (status) {
		case "complete":
			return "wwc:bg-emerald-500";
		case "in-progress":
			return "wwc:bg-blue-500";
		case "at-risk":
			return "wwc:bg-amber-500";
		case "delayed":
			return "wwc:bg-red-500";
		default:
			return "wwc:bg-muted";
	}
}

/** Schedule and cost management with SPI/CPI metrics, activity progress, and cost trends. */
export function ProjectScheduleCost({project}: ProjectScheduleCostProps) {
	const totalBudget = 120; // millions
	const forecastAtCompletion = 115; // millions

	return (
		<div className="wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:p-6 wwc:space-y-6">
				{/* Header */}
				<div>
					<h1 className="wwc:text-2xl wwc:font-semibold">Schedule & Cost</h1>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-1">
						Project management information from P6 and Unifier/Construent for {project.name}
					</p>
				</div>

				{/* KPI Strip */}
				<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2 wwc:lg:grid-cols-4">
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Calendar className="wwc:h-4 wwc:w-4" />
								Schedule Performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:text-2xl wwc:font-bold">0.98</div>
								<Badge variant="outline" className="wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20">
									<AlertTriangle className="wwc:h-3 wwc:w-3" />
									SPI
								</Badge>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">2% behind schedule</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<DollarSign className="wwc:h-4 wwc:w-4" />
								Cost Performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:text-2xl wwc:font-bold">1.04</div>
								<Badge
									variant="outline"
									className="wwc:bg-emerald-500/10 wwc:text-emerald-600 wwc:border-emerald-500/20"
								>
									<TrendingUp className="wwc:h-3 wwc:w-3" />
									CPI
								</Badge>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">4% under budget</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Target className="wwc:h-4 wwc:w-4" />
								Forecast at Completion
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:text-2xl wwc:font-bold">${forecastAtCompletion}M</div>
								<Badge
									variant="outline"
									className="wwc:bg-emerald-500/10 wwc:text-emerald-600 wwc:border-emerald-500/20"
								>
									<TrendingDown className="wwc:h-3 wwc:w-3" />
									-4%
								</Badge>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">Budget: ${totalBudget}M</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Clock className="wwc:h-4 wwc:w-4" />
								Days to Completion
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:text-2xl wwc:font-bold">167</div>
								<Badge variant="outline" className="wwc:bg-blue-500/10 wwc:text-blue-600 wwc:border-blue-500/20">
									Jun 30
								</Badge>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">Target completion date</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<Tabs defaultValue="schedule" className="wwc:space-y-4">
					<TabsList>
						<TabsTrigger value="schedule">Schedule</TabsTrigger>
						<TabsTrigger value="cost">Cost & Budget</TabsTrigger>
						<TabsTrigger value="critical-path">Critical Path</TabsTrigger>
					</TabsList>

					{/* Schedule Tab */}
					<TabsContent value="schedule" className="wwc:space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="wwc:text-base">Activity Progress</CardTitle>
								<CardDescription>Planned vs actual progress by activity</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="wwc:space-y-4">
									{scheduleActivities.map((activity) => (
										<div key={activity.id} className="wwc:space-y-2">
											<div className="wwc:flex wwc:items-center wwc:justify-between">
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<div className={`wwc:w-2 wwc:h-2 wwc:rounded-full ${getStatusColor(activity.status)}`} />
													<span className="wwc:text-sm wwc:font-medium">{activity.name}</span>
												</div>
												<span className="wwc:text-xs wwc:text-muted-foreground">
													{activity.start} - {activity.end}
												</span>
											</div>
											<div className="wwc:relative wwc:h-6 wwc:bg-muted wwc:rounded">
												{/* Planned bar */}
												<div
													className="wwc:absolute wwc:top-0 wwc:h-3 wwc:bg-primary/30 wwc:rounded-t"
													style={{width: `${activity.planned}%`}}
												/>
												{/* Actual bar */}
												<div
													className="wwc:absolute wwc:bottom-0 wwc:h-3 wwc:bg-primary wwc:rounded-b"
													style={{width: `${activity.actual}%`}}
												/>
												{activity.planned > 0 && (
													<span className="wwc:absolute wwc:right-2 wwc:top-1/2 wwc:-translate-y-1/2 wwc:text-xs wwc:font-medium">
														{activity.actual}% / {activity.planned}%
													</span>
												)}
											</div>
										</div>
									))}
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-4 wwc:mt-4 wwc:text-xs wwc:text-muted-foreground">
									<div className="wwc:flex wwc:items-center wwc:gap-2">
										<div className="wwc:w-3 wwc:h-3 wwc:bg-primary/30 wwc:rounded" />
										<span>Planned</span>
									</div>
									<div className="wwc:flex wwc:items-center wwc:gap-2">
										<div className="wwc:w-3 wwc:h-3 wwc:bg-primary wwc:rounded" />
										<span>Actual</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Cost Tab */}
					<TabsContent value="cost" className="wwc:space-y-4">
						<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
							{/* Cost Trend Chart */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">Cost Trend</CardTitle>
									<CardDescription>Planned vs actual expenditure ($ millions)</CardDescription>
								</CardHeader>
								<CardContent>
									<ReactECharts
										option={{
											tooltip: {trigger: "axis"},
											grid: {top: 10, right: 20, bottom: 30, left: 40},
											xAxis: {type: "category", data: costTrendData.map((d) => d.month)},
											yAxis: {type: "value"},
											series: [
												{
													name: "Planned",
													type: "line",
													data: costTrendData.map((d) => d.planned),
													smooth: true,
													lineStyle: {width: 2, type: "dashed", color: "hsl(var(--muted-foreground))"},
													itemStyle: {color: "hsl(var(--muted-foreground))"},
													areaStyle: {color: "hsl(var(--muted))"},
												},
												{
													name: "Actual",
													type: "line",
													data: costTrendData.map((d) => d.actual),
													smooth: true,
													lineStyle: {width: 2, color: "hsl(var(--primary))"},
													itemStyle: {color: "hsl(var(--primary))"},
													areaStyle: {color: "hsl(var(--primary) / 0.2)"},
												},
												{
													name: "Forecast",
													type: "line",
													data: costTrendData.map((d) => d.forecast),
													smooth: true,
													lineStyle: {width: 2, type: "dashed", color: "hsl(var(--chart-3))"},
													itemStyle: {color: "hsl(var(--chart-3))"},
													areaStyle: {color: "hsl(var(--chart-3) / 0.2)"},
												},
											],
										}}
										style={{height: 256}}
									/>
								</CardContent>
							</Card>

							{/* Cost Breakdown */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">Cost Breakdown</CardTitle>
									<CardDescription>Budget vs actual by category ($ millions)</CardDescription>
								</CardHeader>
								<CardContent>
									<ReactECharts
										option={{
											tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
											legend: {bottom: 0, textStyle: {fontSize: 12}},
											grid: {top: 10, right: 20, bottom: 40, left: 90},
											xAxis: {type: "value"},
											yAxis: {type: "category", data: costBreakdown.map((d) => d.category)},
											series: [
												{
													name: "Budget",
													type: "bar",
													data: costBreakdown.map((d) => d.budget),
													itemStyle: {color: "hsl(var(--muted))"},
												},
												{
													name: "Actual",
													type: "bar",
													data: costBreakdown.map((d) => d.actual),
													itemStyle: {color: "hsl(var(--primary))"},
												},
											],
										}}
										style={{height: 256}}
									/>
								</CardContent>
							</Card>
						</div>

						{/* Variance Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="wwc:text-base">Budget Variance</CardTitle>
								<CardDescription>Positive = under budget, Negative = over budget</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-5">
									{costBreakdown.map((item) => (
										<div key={item.category} className="wwc:text-center wwc:p-3 wwc:rounded-lg wwc:border">
											<div className="wwc:text-xs wwc:text-muted-foreground">{item.category}</div>
											<div
												className={`wwc:text-lg wwc:font-bold wwc:mt-1 ${item.variance >= 0 ? "wwc:text-emerald-600" : "wwc:text-red-600"}`}
											>
												{item.variance >= 0 ? "+" : ""}
												{item.variance.toFixed(1)}M
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Critical Path Tab */}
					<TabsContent value="critical-path" className="wwc:space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="wwc:text-base">Critical Path Activities</CardTitle>
								<CardDescription>Sequential activities that determine project duration</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
									{criticalPathItems.map((item, index) => (
										<div key={item.name} className="wwc:flex wwc:items-center wwc:gap-2">
											<div
												className={`wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:border ${
													item.status === "at-risk"
														? "wwc:border-amber-500/50 wwc:bg-amber-500/10"
														: item.status === "on-track"
															? "wwc:border-emerald-500/50 wwc:bg-emerald-500/10"
															: "wwc:border-muted wwc:bg-muted/50"
												}`}
											>
												<div className="wwc:text-sm wwc:font-medium">{item.name}</div>
												<div className="wwc:text-xs wwc:text-muted-foreground">{item.days} days</div>
											</div>
											{index < criticalPathItems.length - 1 && (
												<ArrowRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
											)}
										</div>
									))}
								</div>

								<div className="wwc:mt-6 wwc:p-4 wwc:rounded-lg wwc:bg-muted/50">
									<div className="wwc:text-sm wwc:font-medium wwc:mb-2">Critical Path Summary</div>
									<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-3 wwc:text-sm">
										<div>
											<span className="wwc:text-muted-foreground">Total Float:</span>
											<span className="wwc:ml-2 wwc:font-medium">0 days</span>
										</div>
										<div>
											<span className="wwc:text-muted-foreground">Activities at Risk:</span>
											<span className="wwc:ml-2 wwc:font-medium wwc:text-amber-600">1</span>
										</div>
										<div>
											<span className="wwc:text-muted-foreground">Longest Path:</span>
											<span className="wwc:ml-2 wwc:font-medium">167 days</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
