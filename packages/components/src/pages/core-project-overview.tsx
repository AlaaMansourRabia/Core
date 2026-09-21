import {
	AlertTriangle,
	Calendar,
	Camera,
	CheckCircle2,
	Clock,
	DollarSign,
	TrendingDown,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";

import {Badge} from "../badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../card";
import {Progress} from "../progress";
import type {Project} from "../types";

interface ProjectOverviewProps {
	project: Project;
}

// Mock data for project overview
const mockMilestones = [
	{id: "1", name: "Foundation Complete", dueDate: "Jan 25, 2026", status: "at-risk" as const, daysRemaining: 10},
	{id: "2", name: "Steel Structure", dueDate: "Feb 15, 2026", status: "on-track" as const, daysRemaining: 31},
	{id: "3", name: "MEP Rough-in", dueDate: "Mar 1, 2026", status: "on-track" as const, daysRemaining: 45},
];

const mockDailyStats = {
	workersOnSite: 892,
	workersExpected: 950,
	safetyClearance: 98.2,
	activeZones: 12,
	totalZones: 15,
};

function getStatusColor(status: string | undefined) {
	switch (status) {
		case "on-track":
			return "wwc:bg-emerald-500/10 wwc:text-emerald-600 wwc:border-emerald-500/20";
		case "at-risk":
			return "wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20";
		case "delayed":
		case "critical":
			return "wwc:bg-red-500/10 wwc:text-red-600 wwc:border-red-500/20";
		default:
			return "wwc:bg-muted wwc:text-muted-foreground";
	}
}

function getHealthIcon(status: "on-track" | "at-risk" | "critical" | undefined) {
	switch (status) {
		case "on-track":
			return <TrendingUp className="wwc:h-4 wwc:w-4 wwc:text-emerald-600" />;
		case "at-risk":
			return <AlertTriangle className="wwc:h-4 wwc:w-4 wwc:text-amber-600" />;
		case "critical":
			return <TrendingDown className="wwc:h-4 wwc:w-4 wwc:text-red-600" />;
		default:
			return null;
	}
}

/** Project dashboard with milestones, budget utilization, and safety summary. */
export function ProjectOverview({project}: ProjectOverviewProps) {
	return (
		<div className="wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:p-6 wwc:space-y-6">
				{/* Header */}
				<div className="wwc:flex wwc:items-start wwc:justify-between">
					<div>
						<h1 className="wwc:text-2xl wwc:font-semibold">{project.name}</h1>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-1">
							{project.description || "Project Overview"}
						</p>
					</div>
					<Badge variant="outline" className={getStatusColor(project.status)}>
						{project.status === "on-track" && <CheckCircle2 className="wwc:h-3 wwc:w-3" />}
						{project.status === "at-risk" && <AlertTriangle className="wwc:h-3 wwc:w-3" />}
						{project.status === "delayed" && <XCircle className="wwc:h-3 wwc:w-3" />}
						{project.status?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown"}
					</Badge>
				</div>

				{/* Health Snapshot */}
				<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2 wwc:lg:grid-cols-4">
					{/* Schedule Health */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Calendar className="wwc:h-4 wwc:w-4" />
								Schedule
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div>
									<div className="wwc:text-2xl wwc:font-bold">{project.schedulePercent || 68}%</div>
									<div className="wwc:text-xs wwc:text-muted-foreground">Complete</div>
								</div>
								{getHealthIcon(project.scheduleHealth)}
							</div>
							<Progress value={project.schedulePercent || 68} className="wwc:mt-3 wwc:h-1.5" />
						</CardContent>
					</Card>

					{/* Cost Health - CPI */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<DollarSign className="wwc:h-4 wwc:w-4" />
								Cost Performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div>
									<div className="wwc:text-2xl wwc:font-bold">{project.cpi?.toFixed(2) || "1.00"}</div>
									<div className="wwc:text-xs wwc:text-muted-foreground">
										CPI {(project.budgetVariance || 0) >= 0 ? "+" : ""}
										{project.budgetVariance?.toFixed(1) || "0"}M
									</div>
								</div>
								{getHealthIcon(project.costHealth)}
							</div>
							<Progress value={Math.min((project.cpi || 1) * 50, 100)} className="wwc:mt-3 wwc:h-1.5" />
						</CardContent>
					</Card>

					{/* Workforce Today */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Users className="wwc:h-4 wwc:w-4" />
								Workforce Today
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div>
									<div className="wwc:text-2xl wwc:font-bold">{mockDailyStats.workersOnSite}</div>
									<div className="wwc:text-xs wwc:text-muted-foreground">
										of {mockDailyStats.workersExpected} expected
									</div>
								</div>
								<div className="wwc:text-sm wwc:text-emerald-600 wwc:font-medium">
									{Math.round((mockDailyStats.workersOnSite / mockDailyStats.workersExpected) * 100)}%
								</div>
							</div>
							<Progress
								value={(mockDailyStats.workersOnSite / mockDailyStats.workersExpected) * 100}
								className="wwc:mt-3 wwc:h-1.5"
							/>
						</CardContent>
					</Card>

					{/* Safety Clearance */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<CheckCircle2 className="wwc:h-4 wwc:w-4" />
								Safety Compliance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<div>
									<div className="wwc:text-2xl wwc:font-bold">{mockDailyStats.safetyClearance}%</div>
									<div className="wwc:text-xs wwc:text-muted-foreground">Clearance Rate</div>
								</div>
								<TrendingUp className="wwc:h-4 wwc:w-4 wwc:text-emerald-600" />
							</div>
							<Progress value={mockDailyStats.safetyClearance} className="wwc:mt-3 wwc:h-1.5" />
						</CardContent>
					</Card>
				</div>

				{/* Main Content Grid */}
				<div className="wwc:grid wwc:gap-6 wwc:lg:grid-cols-3">
					{/* Risk Milestones */}
					<Card className="wwc:lg:col-span-2">
						<CardHeader>
							<CardTitle className="wwc:text-base">Upcoming Milestones</CardTitle>
							<CardDescription>Next 3 critical milestones requiring attention</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:space-y-4">
								{mockMilestones.map((milestone) => (
									<div
										key={milestone.id}
										className="wwc:flex wwc:items-center wwc:justify-between wwc:p-3 wwc:rounded-lg wwc:border wwc:bg-card"
									>
										<div className="wwc:flex wwc:items-center wwc:gap-3">
											<div
												className={`wwc:w-2 wwc:h-2 wwc:rounded-full ${
													milestone.status === "on-track"
														? "wwc:bg-emerald-500"
														: milestone.status === "at-risk"
															? "wwc:bg-amber-500"
															: "wwc:bg-red-500"
												}`}
											/>
											<div>
												<div className="wwc:font-medium wwc:text-sm">{milestone.name}</div>
												<div className="wwc:text-xs wwc:text-muted-foreground wwc:flex wwc:items-center wwc:gap-1">
													<Clock className="wwc:h-3 wwc:w-3" />
													Due: {milestone.dueDate}
												</div>
											</div>
										</div>
										<div className="wwc:text-right">
											<Badge variant="outline" className={getStatusColor(milestone.status)}>
												{milestone.daysRemaining} days
											</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Latest Site Visual */}
					<Card>
						<CardHeader>
							<CardTitle className="wwc:text-base">Latest Site Capture</CardTitle>
							<CardDescription>Most recent drone/camera image</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:aspect-video wwc:rounded-lg wwc:border wwc:bg-muted/50 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:text-muted-foreground">
								<Camera className="wwc:h-8 wwc:w-8 wwc:mb-2 wwc:opacity-50" />
								<span className="wwc:text-xs">Today, 2:45 PM</span>
							</div>
							<div className="wwc:mt-3 wwc:flex wwc:items-center wwc:justify-between wwc:text-xs wwc:text-muted-foreground">
								<span>Drone Capture #247</span>
								<span className="wwc:text-primary wwc:cursor-pointer wwc:hover:underline">View All</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Zone Activity */}
				<Card>
					<CardHeader>
						<CardTitle className="wwc:text-base">Active Zones Today</CardTitle>
						<CardDescription>
							{mockDailyStats.activeZones} of {mockDailyStats.totalZones} zones with active workforce
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="wwc:grid wwc:grid-cols-5 wwc:gap-2">
							{Array.from({length: mockDailyStats.totalZones}).map((_, i) => (
								<div
									key={i}
									className={`wwc:aspect-square wwc:rounded-lg wwc:border wwc:flex wwc:items-center wwc:justify-center wwc:text-xs wwc:font-medium ${
										i < mockDailyStats.activeZones
											? "wwc:bg-primary/10 wwc:text-primary wwc:border-primary/20"
											: "wwc:bg-muted/50 wwc:text-muted-foreground"
									}`}
								>
									Z{i + 1}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
