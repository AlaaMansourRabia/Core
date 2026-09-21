import ReactECharts from "echarts-for-react";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Clock,
	HardHat,
	MapPin,
	Shield,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";

import {Badge} from "../badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../card";
import {KPISummary} from "../kpi-summary";
import {Progress} from "../progress";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import type {Project} from "../types";

interface ProjectWorkforceSafetyProps {
	project: Project;
}

// Mock workforce data
const zoneAllocation = [
	{zone: "Zone A - Foundation", workers: 145, capacity: 180, status: "normal"},
	{zone: "Zone B - Steel Frame", workers: 198, capacity: 200, status: "high"},
	{zone: "Zone C - MEP Area", workers: 87, capacity: 120, status: "normal"},
	{zone: "Zone D - Facade", workers: 62, capacity: 100, status: "low"},
	{zone: "Zone E - Interior", workers: 124, capacity: 150, status: "normal"},
	{zone: "Zone F - Roof", workers: 45, capacity: 50, status: "high"},
];

const headcountTrend = [
	{time: "6:00", workers: 120},
	{time: "7:00", workers: 456},
	{time: "8:00", workers: 725},
	{time: "9:00", workers: 812},
	{time: "10:00", workers: 865},
	{time: "11:00", workers: 892},
	{time: "12:00", workers: 634},
	{time: "13:00", workers: 845},
	{time: "14:00", workers: 878},
	{time: "15:00", workers: 856},
];

const tradeBreakdown = [
	{name: "Civil", value: 245, color: "hsl(var(--chart-1))"},
	{name: "Structural", value: 198, color: "hsl(var(--chart-2))"},
	{name: "MEP", value: 156, color: "hsl(var(--chart-3))"},
	{name: "Finishing", value: 134, color: "hsl(var(--chart-4))"},
	{name: "Others", value: 159, color: "hsl(var(--chart-5))"},
];

const safetyAlerts = [
	{id: "1", type: "warning", message: "PPE non-compliance detected in Zone B", time: "2 mins ago", zone: "Zone B"},
	{id: "2", type: "alert", message: "Unauthorized entry to restricted area", time: "15 mins ago", zone: "Zone F"},
	{id: "3", type: "info", message: "Safety briefing completed - 45 workers", time: "1 hour ago", zone: "All Zones"},
	{
		id: "4",
		type: "warning",
		message: "High density alert - Zone B approaching capacity",
		time: "2 hours ago",
		zone: "Zone B",
	},
];

const complianceMetrics = [
	{metric: "PPE Compliance", value: 98.2, trend: "up"},
	{metric: "Safety Training", value: 94.5, trend: "up"},
	{metric: "Permit Validity", value: 100, trend: "stable"},
	{metric: "Toolbox Talks", value: 87.3, trend: "down"},
];

function getAlertIcon(type: string) {
	switch (type) {
		case "alert":
			return <AlertCircle className="wwc:h-4 wwc:w-4 wwc:text-red-500" />;
		case "warning":
			return <AlertTriangle className="wwc:h-4 wwc:w-4 wwc:text-amber-500" />;
		default:
			return <CheckCircle2 className="wwc:h-4 wwc:w-4 wwc:text-emerald-500" />;
	}
}

function getZoneStatusColor(status: string) {
	switch (status) {
		case "high":
			return "wwc:text-amber-600 wwc:bg-amber-500/10";
		case "low":
			return "wwc:text-blue-600 wwc:bg-blue-500/10";
		default:
			return "wwc:text-emerald-600 wwc:bg-emerald-500/10";
	}
}

/** Workforce headcount, safety score, zone allocation, and safety alert tracking. */
export function ProjectWorkforceSafety({project}: ProjectWorkforceSafetyProps) {
	const totalWorkers = 892;
	const expectedWorkers = 950;
	const safetyScore = 96.4;

	return (
		<div className="wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:p-6 wwc:space-y-6">
				{/* Header */}
				<div>
					<h1 className="wwc:text-2xl wwc:font-semibold">Workforce & Safety</h1>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-1">
						Live workforce tracking and safety compliance monitoring for {project.name}
					</p>
				</div>

				{/* KPI Strip */}
				<KPISummary
					columns={4}
					metrics={[
						{
							title: "Live Headcount",
							value: totalWorkers,
							icon: Users,
							trend: "up",
							trendLabel: "+12",
							subtitle: `${Math.round((totalWorkers / expectedWorkers) * 100)}% of ${expectedWorkers} expected`,
						},
						{
							title: "Safety Score",
							value: `${safetyScore}%`,
							icon: Shield,
							status: "success",
							trendLabel: "Excellent",
							subtitle: "0 incidents this week",
						},
						{
							title: "PPE Compliance",
							value: "98.2%",
							icon: HardHat,
							trend: "up",
							trendLabel: "+0.5%",
							subtitle: "16 non-compliant detected today",
						},
					]}
				>
					{/* Multi-badge severity breakdown — bespoke trailing tile (exceeds MetricCard's single-trend contract) */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<AlertTriangle className="wwc:h-4 wwc:w-4" />
								Active Alerts
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:text-2xl wwc:font-bold">4</div>
								<div className="wwc:flex wwc:gap-1">
									<Badge
										variant="outline"
										className="wwc:bg-red-500/10 wwc:text-red-600 wwc:border-red-500/20 wwc:text-xs wwc:px-1.5"
									>
										1
									</Badge>
									<Badge
										variant="outline"
										className="wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20 wwc:text-xs wwc:px-1.5"
									>
										2
									</Badge>
									<Badge
										variant="outline"
										className="wwc:bg-blue-500/10 wwc:text-blue-600 wwc:border-blue-500/20 wwc:text-xs wwc:px-1.5"
									>
										1
									</Badge>
								</div>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-3">Last alert 2 mins ago</p>
						</CardContent>
					</Card>
				</KPISummary>

				{/* Main Content */}
				<Tabs defaultValue="workforce" className="wwc:space-y-4">
					<TabsList>
						<TabsTrigger value="workforce">Workforce</TabsTrigger>
						<TabsTrigger value="zones">Zone Allocation</TabsTrigger>
						<TabsTrigger value="safety">Safety & Compliance</TabsTrigger>
					</TabsList>

					{/* Workforce Tab */}
					<TabsContent value="workforce" className="wwc:space-y-4">
						<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
							{/* Headcount Trend */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">Today's Headcount</CardTitle>
									<CardDescription>Workers on site throughout the day</CardDescription>
								</CardHeader>
								<CardContent>
									<ReactECharts
										option={{
											tooltip: {trigger: "axis"},
											grid: {top: 10, right: 20, bottom: 30, left: 40},
											xAxis: {type: "category", data: headcountTrend.map((d) => d.time)},
											yAxis: {type: "value"},
											series: [
												{
													type: "line",
													data: headcountTrend.map((d) => d.workers),
													smooth: true,
													lineStyle: {width: 2, color: "hsl(var(--primary))"},
													itemStyle: {color: "hsl(var(--primary))"},
													areaStyle: {color: "hsl(var(--primary) / 0.2)"},
												},
											],
										}}
										style={{height: 256}}
									/>
								</CardContent>
							</Card>

							{/* Trade Breakdown */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">Trade Distribution</CardTitle>
									<CardDescription>Workers by trade category</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="wwc:h-64 wwc:flex wwc:items-center">
										<div className="wwc:w-1/2">
											<ReactECharts
												option={{
													tooltip: {trigger: "item"},
													series: [
														{
															type: "pie",
															radius: ["40%", "65%"],
															data: tradeBreakdown.map((d) => ({
																value: d.value,
																name: d.name,
																itemStyle: {color: d.color},
															})),
															label: {show: false},
														},
													],
												}}
												style={{height: 200}}
											/>
										</div>
										<div className="wwc:w-1/2 wwc:space-y-2">
											{tradeBreakdown.map((trade) => (
												<div key={trade.name} className="wwc:flex wwc:items-center wwc:justify-between wwc:text-sm">
													<div className="wwc:flex wwc:items-center wwc:gap-2">
														<div className="wwc:w-3 wwc:h-3 wwc:rounded-sm" style={{backgroundColor: trade.color}} />
														<span>{trade.name}</span>
													</div>
													<span className="wwc:font-medium">{trade.value}</span>
												</div>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Zone Allocation Tab */}
					<TabsContent value="zones" className="wwc:space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="wwc:text-base">Zone Allocation</CardTitle>
								<CardDescription>Worker distribution across project zones</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="wwc:space-y-4">
									{zoneAllocation.map((zone) => (
										<div key={zone.zone} className="wwc:space-y-2">
											<div className="wwc:flex wwc:items-center wwc:justify-between">
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<MapPin className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
													<span className="wwc:text-sm wwc:font-medium">{zone.zone}</span>
												</div>
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<span className="wwc:text-sm">
														{zone.workers} / {zone.capacity}
													</span>
													<Badge variant="outline" className={`wwc:text-xs ${getZoneStatusColor(zone.status)}`}>
														{Math.round((zone.workers / zone.capacity) * 100)}%
													</Badge>
												</div>
											</div>
											<Progress
												value={(zone.workers / zone.capacity) * 100}
												className={`wwc:h-2 ${zone.status === "high" ? "wwc:[&>div]:bg-amber-500" : ""}`}
											/>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Safety Tab */}
					<TabsContent value="safety" className="wwc:space-y-4">
						<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
							{/* Compliance Metrics */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">Compliance Metrics</CardTitle>
									<CardDescription>Safety compliance overview</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="wwc:space-y-4">
										{complianceMetrics.map((item) => (
											<div key={item.metric} className="wwc:flex wwc:items-center wwc:justify-between">
												<span className="wwc:text-sm">{item.metric}</span>
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<Progress value={item.value} className="wwc:w-24 wwc:h-2" />
													<span className="wwc:text-sm wwc:font-medium wwc:w-12 wwc:text-right">{item.value}%</span>
													{item.trend === "up" && <TrendingUp className="wwc:h-3 wwc:w-3 wwc:text-emerald-500" />}
													{item.trend === "down" && <TrendingDown className="wwc:h-3 wwc:w-3 wwc:text-red-500" />}
													{item.trend === "stable" && <span className="wwc:w-3" />}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Recent Alerts */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">Recent Alerts</CardTitle>
									<CardDescription>Safety alerts and notifications</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="wwc:space-y-3">
										{safetyAlerts.map((alert) => (
											<div
												key={alert.id}
												className="wwc:flex wwc:items-start wwc:gap-3 wwc:p-3 wwc:rounded-lg wwc:border wwc:bg-card"
											>
												{getAlertIcon(alert.type)}
												<div className="wwc:flex-1 wwc:min-w-0">
													<p className="wwc:text-sm">{alert.message}</p>
													<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
														<Clock className="wwc:h-3 wwc:w-3" />
														<span>{alert.time}</span>
														<span>•</span>
														<span>{alert.zone}</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
