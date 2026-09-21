import ReactECharts from "echarts-for-react";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	ClipboardList,
	Clock,
	FileWarning,
	Filter,
	XCircle,
} from "lucide-react";

import {Badge} from "../badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../card";
import {KPISummary} from "../kpi-summary";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import type {Project} from "../types";

interface ProjectQualityIssuesProps {
	project: Project;
}

// Mock NCR data
const ncrList = [
	{
		id: "NCR-2026-047",
		title: "Concrete strength below specification",
		discipline: "Structural",
		status: "open",
		priority: "high",
		daysOpen: 3,
		zone: "Zone A",
	},
	{
		id: "NCR-2026-046",
		title: "Rebar spacing non-conformance",
		discipline: "Structural",
		status: "in-review",
		priority: "medium",
		daysOpen: 7,
		zone: "Zone B",
	},
	{
		id: "NCR-2026-045",
		title: "MEP penetration misalignment",
		discipline: "MEP",
		status: "open",
		priority: "high",
		daysOpen: 2,
		zone: "Zone C",
	},
	{
		id: "NCR-2026-044",
		title: "Waterproofing membrane defect",
		discipline: "Civil",
		status: "closed",
		priority: "low",
		daysOpen: 12,
		zone: "Zone A",
	},
	{
		id: "NCR-2026-043",
		title: "Fire stop installation incomplete",
		discipline: "Fire Protection",
		status: "in-review",
		priority: "medium",
		daysOpen: 5,
		zone: "Zone D",
	},
];

// Mock issues data
const openIssues = [
	{
		id: "ISS-892",
		title: "Material delivery delay - Steel beams",
		category: "Supply Chain",
		priority: "critical",
		assignee: "Procurement Team",
		dueDate: "Jan 18",
	},
	{
		id: "ISS-891",
		title: "Coordination conflict - HVAC vs Electrical",
		category: "Design",
		priority: "high",
		assignee: "MEP Coordinator",
		dueDate: "Jan 20",
	},
	{
		id: "ISS-890",
		title: "RFI pending - Foundation waterproofing detail",
		category: "RFI",
		priority: "medium",
		assignee: "Design Team",
		dueDate: "Jan 22",
	},
	{
		id: "ISS-889",
		title: "Subcontractor resource shortage",
		category: "Resource",
		priority: "high",
		assignee: "Project Manager",
		dueDate: "Jan 19",
	},
	{
		id: "ISS-888",
		title: "Weather delay impact assessment",
		category: "Schedule",
		priority: "medium",
		assignee: "Planner",
		dueDate: "Jan 21",
	},
];

// Mock quality trend data
const qualityTrendData = [
	{week: "W1", ncrs: 5, issues: 12, resolved: 8},
	{week: "W2", ncrs: 3, issues: 15, resolved: 14},
	{week: "W3", ncrs: 7, issues: 10, resolved: 11},
	{week: "W4", ncrs: 4, issues: 8, resolved: 9},
	{week: "W5", ncrs: 2, issues: 6, resolved: 7},
	{week: "W6", ncrs: 3, issues: 9, resolved: 10},
];

const ncrByDiscipline = [
	{discipline: "Structural", open: 8, closed: 24},
	{discipline: "MEP", open: 5, closed: 18},
	{discipline: "Civil", open: 3, closed: 12},
	{discipline: "Architectural", open: 2, closed: 8},
	{discipline: "Fire Protection", open: 2, closed: 6},
];

function getPriorityColor(priority: string) {
	switch (priority) {
		case "critical":
			return "wwc:bg-red-500/10 wwc:text-red-600 wwc:border-red-500/20";
		case "high":
			return "wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20";
		case "medium":
			return "wwc:bg-blue-500/10 wwc:text-blue-600 wwc:border-blue-500/20";
		default:
			return "wwc:bg-muted wwc:text-muted-foreground";
	}
}

function getStatusColor(status: string) {
	switch (status) {
		case "open":
			return "wwc:bg-red-500/10 wwc:text-red-600 wwc:border-red-500/20";
		case "in-review":
			return "wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20";
		case "closed":
			return "wwc:bg-emerald-500/10 wwc:text-emerald-600 wwc:border-emerald-500/20";
		default:
			return "wwc:bg-muted wwc:text-muted-foreground";
	}
}

function getPriorityIcon(priority: string) {
	switch (priority) {
		case "critical":
			return <XCircle className="wwc:h-4 wwc:w-4 wwc:text-red-500" />;
		case "high":
			return <AlertCircle className="wwc:h-4 wwc:w-4 wwc:text-amber-500" />;
		default:
			return <AlertTriangle className="wwc:h-4 wwc:w-4 wwc:text-blue-500" />;
	}
}

/** NCR management, open issues tracking, and quality trend analysis. */
export function ProjectQualityIssues({project}: ProjectQualityIssuesProps) {
	const openNCRs = 20;
	const closedNCRs = 68;
	const openIssuesCount = 14;
	const avgResolutionDays = 8.5;

	return (
		<div className="wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:p-6 wwc:space-y-6">
				{/* Header */}
				<div>
					<h1 className="wwc:text-2xl wwc:font-semibold">Quality & Issues</h1>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-1">
						Non-conformance reports, open issues, and quality performance tracking for {project.name}
					</p>
				</div>

				{/* KPI Strip */}
				<KPISummary
					columns={4}
					metrics={[
						{
							title: "Open NCRs",
							value: openNCRs,
							icon: FileWarning,
							trend: "down",
							trendLabel: "-3",
							status: "warning",
							subtitle: `${closedNCRs} closed this month`,
						},
						{
							title: "Avg Resolution",
							value: `${avgResolutionDays} days`,
							icon: Clock,
							trend: "down",
							trendLabel: "-1.2d",
							status: "success",
							subtitle: "Target: 7 days",
						},
						{
							title: "Resolution Rate",
							value: "94%",
							icon: CheckCircle2,
							trend: "up",
							trendLabel: "+2%",
							status: "success",
						},
					]}
				>
					{/* Bespoke "Open Issues" tile (3 severity badges) — trailing slot; reordered to last. */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<ClipboardList className="wwc:h-4 wwc:w-4" />
								Open Issues
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div className="wwc:text-2xl wwc:font-bold">{openIssuesCount}</div>
								<div className="wwc:flex wwc:gap-1">
									<Badge
										variant="outline"
										className="wwc:bg-red-500/10 wwc:text-red-600 wwc:border-red-500/20 wwc:text-xs wwc:px-1.5"
									>
										2
									</Badge>
									<Badge
										variant="outline"
										className="wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20 wwc:text-xs wwc:px-1.5"
									>
										5
									</Badge>
									<Badge
										variant="outline"
										className="wwc:bg-blue-500/10 wwc:text-blue-600 wwc:border-blue-500/20 wwc:text-xs wwc:px-1.5"
									>
										7
									</Badge>
								</div>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">By priority: Critical, High, Medium</p>
						</CardContent>
					</Card>
				</KPISummary>

				{/* Main Content */}
				<Tabs defaultValue="ncrs" className="wwc:space-y-4">
					<TabsList>
						<TabsTrigger value="ncrs">NCRs</TabsTrigger>
						<TabsTrigger value="issues">Open Issues</TabsTrigger>
						<TabsTrigger value="trends">Quality Trends</TabsTrigger>
					</TabsList>

					{/* NCRs Tab */}
					<TabsContent value="ncrs" className="wwc:space-y-4">
						<Card>
							<CardHeader>
								<div className="wwc:flex wwc:items-center wwc:justify-between">
									<div>
										<CardTitle className="wwc:text-base">Non-Conformance Reports</CardTitle>
										<CardDescription>Active NCRs requiring attention</CardDescription>
									</div>
									<Badge variant="outline" className="wwc:cursor-pointer">
										<Filter className="wwc:h-3 wwc:w-3" />
										Filter
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="wwc:space-y-3">
									{ncrList.map((ncr) => (
										<div
											key={ncr.id}
											className="wwc:flex wwc:items-center wwc:justify-between wwc:p-3 wwc:rounded-lg wwc:border wwc:bg-card wwc:hover:bg-muted/50 wwc:transition-colors wwc:cursor-pointer"
										>
											<div className="wwc:flex wwc:items-start wwc:gap-3">
												{getPriorityIcon(ncr.priority)}
												<div>
													<div className="wwc:flex wwc:items-center wwc:gap-2">
														<span className="wwc:text-sm wwc:font-medium">{ncr.id}</span>
														<Badge variant="outline" className={`wwc:text-xs ${getStatusColor(ncr.status)}`}>
															{ncr.status.replace("-", " ")}
														</Badge>
													</div>
													<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-0.5">{ncr.title}</p>
													<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
														<span>{ncr.discipline}</span>
														<span>•</span>
														<span>{ncr.zone}</span>
													</div>
												</div>
											</div>
											<div className="wwc:text-right">
												<Badge variant="outline" className={getPriorityColor(ncr.priority)}>
													{ncr.priority}
												</Badge>
												<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">{ncr.daysOpen} days open</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Issues Tab */}
					<TabsContent value="issues" className="wwc:space-y-4">
						<Card>
							<CardHeader>
								<div className="wwc:flex wwc:items-center wwc:justify-between">
									<div>
										<CardTitle className="wwc:text-base">Open Issues</CardTitle>
										<CardDescription>Issues requiring resolution</CardDescription>
									</div>
									<Badge variant="outline" className="wwc:cursor-pointer">
										<Filter className="wwc:h-3 wwc:w-3" />
										Filter
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="wwc:space-y-3">
									{openIssues.map((issue) => (
										<div
											key={issue.id}
											className="wwc:flex wwc:items-center wwc:justify-between wwc:p-3 wwc:rounded-lg wwc:border wwc:bg-card wwc:hover:bg-muted/50 wwc:transition-colors wwc:cursor-pointer"
										>
											<div className="wwc:flex wwc:items-start wwc:gap-3">
												{getPriorityIcon(issue.priority)}
												<div>
													<div className="wwc:flex wwc:items-center wwc:gap-2">
														<span className="wwc:text-sm wwc:font-medium">{issue.id}</span>
														<Badge variant="outline" className="wwc:text-xs">
															{issue.category}
														</Badge>
													</div>
													<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-0.5">{issue.title}</p>
													<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
														<span>Assignee: {issue.assignee}</span>
													</div>
												</div>
											</div>
											<div className="wwc:text-right">
												<Badge variant="outline" className={getPriorityColor(issue.priority)}>
													{issue.priority}
												</Badge>
												<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">Due: {issue.dueDate}</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Trends Tab */}
					<TabsContent value="trends" className="wwc:space-y-4">
						<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
							{/* Weekly Trend */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">Weekly Quality Trend</CardTitle>
									<CardDescription>NCRs and issues over time</CardDescription>
								</CardHeader>
								<CardContent>
									<ReactECharts
										option={{
											tooltip: {trigger: "axis"},
											legend: {bottom: 0, textStyle: {fontSize: 12}},
											grid: {top: 10, right: 20, bottom: 40, left: 40},
											xAxis: {type: "category", data: qualityTrendData.map((d) => d.week)},
											yAxis: {type: "value"},
											series: [
												{
													name: "NCRs",
													type: "line",
													data: qualityTrendData.map((d) => d.ncrs),
													smooth: true,
													lineStyle: {width: 2, color: "hsl(var(--destructive))"},
													itemStyle: {color: "hsl(var(--destructive))"},
												},
												{
													name: "Issues",
													type: "line",
													data: qualityTrendData.map((d) => d.issues),
													smooth: true,
													lineStyle: {width: 2, color: "hsl(var(--chart-3))"},
													itemStyle: {color: "hsl(var(--chart-3))"},
												},
												{
													name: "Resolved",
													type: "line",
													data: qualityTrendData.map((d) => d.resolved),
													smooth: true,
													lineStyle: {width: 2, color: "hsl(var(--primary))"},
													itemStyle: {color: "hsl(var(--primary))"},
												},
											],
										}}
										style={{height: 256}}
									/>
								</CardContent>
							</Card>

							{/* NCR by Discipline */}
							<Card>
								<CardHeader>
									<CardTitle className="wwc:text-base">NCRs by Discipline</CardTitle>
									<CardDescription>Open vs closed NCRs</CardDescription>
								</CardHeader>
								<CardContent>
									<ReactECharts
										option={{
											tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
											legend: {bottom: 0, textStyle: {fontSize: 12}},
											grid: {top: 10, right: 20, bottom: 40, left: 90},
											xAxis: {type: "value"},
											yAxis: {type: "category", data: ncrByDiscipline.map((d) => d.discipline)},
											series: [
												{
													name: "Open",
													type: "bar",
													data: ncrByDiscipline.map((d) => d.open),
													itemStyle: {color: "hsl(var(--destructive))"},
												},
												{
													name: "Closed",
													type: "bar",
													data: ncrByDiscipline.map((d) => d.closed),
													itemStyle: {color: "hsl(var(--primary))"},
												},
											],
										}}
										style={{height: 256}}
									/>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
