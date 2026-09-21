import {addDays, subDays} from "date-fns";
import {ChevronDown, ChevronRight, Eye, ListFilter} from "lucide-react";
import {useState} from "react";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	Gantt,
	GanttBar,
	GanttBody,
	GanttHeader,
	GanttMilestone,
	GanttRow,
	GanttSidebarCell,
	GanttTimelineCell,
} from "@/components/ui/gantt";

// Sample data
const today = new Date();
const chartStart = subDays(today, 10);
const chartEnd = addDays(today, 30);

const teamMembers = [
	{
		id: "1",
		name: "John Smith",
		avatar: "",
		department: "Marketing",
		tasks: [
			{
				id: "t1",
				name: "Front end development 2.0",
				startDate: subDays(today, 8),
				endDate: addDays(today, 5),
				color: "chart1" as const,
			},
			{
				id: "t2",
				name: "API Integration",
				startDate: addDays(today, 2),
				endDate: addDays(today, 12),
				color: "chart2" as const,
			},
			{
				id: "t3",
				name: "Testing phase",
				startDate: addDays(today, 8),
				endDate: addDays(today, 18),
				color: "chart3" as const,
			},
		],
	},
	{
		id: "2",
		name: "Ariel Castaneda",
		avatar: "",
		department: "Marketing",
		tasks: [
			{
				id: "t4",
				name: "UI Design",
				startDate: addDays(today, 3),
				endDate: addDays(today, 15),
				color: "chart1" as const,
			},
			{
				id: "t5",
				name: "User Research",
				startDate: addDays(today, 10),
				endDate: addDays(today, 20),
				color: "chart2" as const,
			},
			{
				id: "t6",
				name: "Prototyping",
				startDate: addDays(today, 15),
				endDate: addDays(today, 25),
				color: "chart4" as const,
			},
		],
	},
	{
		id: "3",
		name: "Edward Coleman",
		avatar: "",
		department: "Product Desktop",
		tasks: [
			{
				id: "t7",
				name: "Backend development",
				startDate: subDays(today, 2),
				endDate: addDays(today, 8),
				color: "chart3" as const,
			},
			{
				id: "t8",
				name: "Database optimization",
				startDate: addDays(today, 5),
				endDate: addDays(today, 12),
				color: "chart5" as const,
			},
			{
				id: "t9",
				name: "Security audit",
				startDate: addDays(today, 10),
				endDate: addDays(today, 16),
				color: "chart4" as const,
			},
		],
	},
	{
		id: "4",
		name: "Watson Ponce",
		avatar: "",
		department: "Product Mobile",
		tasks: [
			{
				id: "t10",
				name: "Mobile app development",
				startDate: addDays(today, 5),
				endDate: addDays(today, 22),
				color: "chart2" as const,
			},
			{
				id: "t11",
				name: "Push notifications",
				startDate: addDays(today, 15),
				endDate: addDays(today, 20),
				color: "chart1" as const,
			},
			{
				id: "t12",
				name: "App store submission",
				startDate: addDays(today, 20),
				endDate: addDays(today, 25),
				color: "default" as const,
			},
		],
	},
];

const projectTasks = [
	{
		id: "g1",
		name: "Project Kickoff & Planning",
		status: "Completed",
		isGroup: true,
		expanded: true,
		tasks: [
			{
				id: "pt1",
				name: "Define project objectives",
				status: "Completed",
				startDate: subDays(today, 8),
				endDate: subDays(today, 5),
				color: "chart3" as const,
			},
			{
				id: "pt2",
				name: "Identify target audience",
				status: "Completed",
				startDate: subDays(today, 5),
				endDate: subDays(today, 2),
				color: "chart3" as const,
			},
		],
	},
	{
		id: "g2",
		name: "Research and Analysis",
		status: "Completed",
		isGroup: true,
		expanded: true,
		tasks: [
			{
				id: "pt3",
				name: "Conduct user research",
				status: "Completed",
				startDate: subDays(today, 2),
				endDate: today,
				color: "chart3" as const,
			},
			{
				id: "pt4",
				name: "Analyze competitors",
				status: "Completed",
				startDate: subDays(today, 1),
				endDate: addDays(today, 1),
				color: "chart3" as const,
			},
			{
				id: "pt5",
				name: "Create user personas",
				status: "Pending",
				startDate: addDays(today, 2),
				endDate: addDays(today, 8),
				color: "chart3" as const,
			},
		],
	},
	{
		id: "g3",
		name: "Wireframing",
		status: "Review",
		isGroup: true,
		expanded: true,
		tasks: [
			{
				id: "pt6",
				name: "Design low-fidelity wireframes",
				status: "Completed",
				startDate: today,
				endDate: addDays(today, 2),
				color: "chart4" as const,
			},
			{
				id: "pt7",
				name: "Review and iterate",
				status: "Review",
				startDate: addDays(today, 2),
				endDate: addDays(today, 6),
				color: "chart4" as const,
			},
		],
	},
	{
		id: "g4",
		name: "Visual Design",
		status: "In progress",
		isGroup: true,
		expanded: true,
		tasks: [
			{
				id: "pt8",
				name: "Develop visual style",
				status: "In progress",
				startDate: addDays(today, 5),
				endDate: addDays(today, 10),
				color: "chart2" as const,
			},
			{
				id: "pt9",
				name: "Create high-fidelity mockups",
				status: "Pending",
				startDate: addDays(today, 8),
				endDate: addDays(today, 15),
				color: "chart3" as const,
			},
		],
	},
];

export function GanttPage() {
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
		g1: true,
		g2: true,
		g3: true,
		g4: true,
	});

	const toggleGroup = (id: string) => {
		setExpandedGroups((prev) => ({...prev, [id]: !prev[id]}));
	};

	const getStatusColor = (status: string): "default" | "secondary" | "outline" => {
		switch (status) {
			case "Completed":
				return "default";
			case "In progress":
				return "secondary";
			case "Review":
				return "outline";
			default:
				return "secondary";
		}
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Gantt Chart</h1>
					<CopyButton
						value="Gantt Chart"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A timeline view component for visualizing tasks, schedules, and project timelines.
				</p>
			</div>

			<div className="wwc:space-y-8">
				{/* Resource-based Gantt (Team View) */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Team Resource View</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Shows team members with their assigned tasks across a timeline. The sidebar stays fixed while the timeline
						scrolls.
					</p>
					<Gantt startDate={chartStart} endDate={chartEnd} columnWidth={35} rowHeight={120} sidebarWidth={280}>
						<GanttHeader />
						<GanttBody>
							{teamMembers.map((member) => (
								<GanttRow key={member.id}>
									<GanttSidebarCell>
										<div className="wwc:flex wwc:items-start wwc:gap-3 wwc:w-full">
											<Avatar className="wwc:h-8 wwc:w-8 wwc:mt-0.5">
												<AvatarImage src={member.avatar} />
												<AvatarFallback className="wwc:text-xs">
													{member.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="wwc:flex-1 wwc:min-w-0">
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<span className="wwc:font-medium wwc:text-sm wwc:truncate">{member.name}</span>
													<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:ml-auto">
														<Button variant="ghost" icon className="wwc:h-6 wwc:w-6">
															<ListFilter className="wwc:h-3 wwc:w-3" />
														</Button>
														<Button variant="ghost" icon className="wwc:h-6 wwc:w-6">
															<Eye className="wwc:h-3 wwc:w-3" />
														</Button>
													</div>
												</div>
												<Badge variant="outline" className="wwc:mt-1.5 wwc:text-[10px] wwc:h-5">
													{member.department}
												</Badge>
											</div>
										</div>
									</GanttSidebarCell>
									<GanttTimelineCell>
										{member.tasks.map((task, index) => (
											<GanttBar
												key={task.id}
												startDate={task.startDate}
												endDate={task.endDate}
												color={task.color}
												label={task.name}
												style={{top: index * 28 + 4}}
											/>
										))}
									</GanttTimelineCell>
								</GanttRow>
							))}
						</GanttBody>
					</Gantt>
				</div>

				{/* Project Task Gantt */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Project Task View</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Hierarchical task groups with status indicators and collapsible sections.
					</p>
					<Gantt
						startDate={subDays(today, 10)}
						endDate={addDays(today, 35)}
						columnWidth={40}
						rowHeight={44}
						sidebarWidth={400}
					>
						<GanttHeader />
						<GanttBody>
							{projectTasks.map((group) => (
								<>
									{/* Group header row */}
									<GanttRow key={group.id} isGroup>
										<GanttSidebarCell className="wwc:p-0">
											<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:w-full wwc:h-full wwc:px-3">
												<Button variant="ghost" icon className="wwc:h-5 wwc:w-5" onClick={() => toggleGroup(group.id)}>
													{expandedGroups[group.id] ? (
														<ChevronDown className="wwc:h-3 wwc:w-3" />
													) : (
														<ChevronRight className="wwc:h-3 wwc:w-3" />
													)}
												</Button>
												<span className="wwc:font-medium wwc:text-sm">{group.name}</span>
											</div>
										</GanttSidebarCell>
										<GanttTimelineCell>
											{/* Group bar spanning all child tasks */}
											{group.tasks.length > 0 && (
												<GanttBar
													startDate={group.tasks[0].startDate}
													endDate={group.tasks[group.tasks.length - 1].endDate}
													color={group.tasks[0].color}
													showLabel={false}
													className="wwc:h-2 wwc:top-1/2 wwc:-translate-y-1/2"
												/>
											)}
										</GanttTimelineCell>
									</GanttRow>

									{/* Child task rows */}
									{expandedGroups[group.id] &&
										group.tasks.map((task) => (
											<GanttRow key={task.id}>
												<GanttSidebarCell className="wwc:p-0">
													<div className="wwc:flex wwc:items-stretch wwc:w-full wwc:h-full">
														<div className="wwc:flex-1 wwc:pl-7 wwc:px-3 wwc:flex wwc:items-center wwc:gap-2 wwc:min-w-0">
															<div className="wwc:w-4 wwc:h-4 wwc:rounded-full wwc:border-2 wwc:border-muted-foreground/30 wwc:shrink-0" />
															<span className="wwc:text-sm wwc:truncate">{task.name}</span>
														</div>
														<div className="wwc:w-24 wwc:px-3 wwc:border-l wwc:shrink-0 wwc:flex wwc:items-center">
															<Badge variant={getStatusColor(task.status)} className="wwc:text-[10px] wwc:h-5">
																{task.status}
															</Badge>
														</div>
														<div className="wwc:w-24 wwc:px-3 wwc:border-l wwc:text-xs wwc:text-muted-foreground wwc:shrink-0 wwc:flex wwc:items-center">
															{task.startDate.toLocaleDateString("en-US", {month: "short", day: "numeric"})}
														</div>
													</div>
												</GanttSidebarCell>
												<GanttTimelineCell>
													<GanttBar
														startDate={task.startDate}
														endDate={task.endDate}
														color={task.color}
														showLabel={false}
													/>
												</GanttTimelineCell>
											</GanttRow>
										))}
								</>
							))}
						</GanttBody>
					</Gantt>
				</div>

				{/* Simple Timeline */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Simple Timeline</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						A minimal timeline view with task names and duration bars.
					</p>
					<Gantt
						startDate={subDays(today, 5)}
						endDate={addDays(today, 25)}
						columnWidth={30}
						rowHeight={50}
						sidebarWidth={200}
					>
						<GanttHeader />
						<GanttBody>
							{[
								{id: "s1", name: "Planning", startDate: subDays(today, 3), endDate: today, color: "chart1" as const},
								{
									id: "s2",
									name: "Design",
									startDate: addDays(today, 1),
									endDate: addDays(today, 7),
									color: "chart2" as const,
								},
								{
									id: "s3",
									name: "Development",
									startDate: addDays(today, 5),
									endDate: addDays(today, 18),
									color: "chart3" as const,
								},
								{
									id: "s4",
									name: "Testing",
									startDate: addDays(today, 15),
									endDate: addDays(today, 22),
									color: "chart4" as const,
								},
								{
									id: "s5",
									name: "Launch",
									startDate: addDays(today, 22),
									endDate: addDays(today, 24),
									color: "chart5" as const,
								},
								{
									id: "s6",
									name: "Marketing",
									startDate: addDays(today, 10),
									endDate: addDays(today, 20),
									color: "default" as const,
								},
								{
									id: "s7",
									name: "Documentation",
									startDate: addDays(today, 8),
									endDate: addDays(today, 16),
									color: "muted" as const,
								},
							].map((task) => (
								<GanttRow key={task.id}>
									<GanttSidebarCell>
										<span className="wwc:text-sm wwc:font-medium">{task.name}</span>
									</GanttSidebarCell>
									<GanttTimelineCell>
										<GanttBar startDate={task.startDate} endDate={task.endDate} color={task.color} label={task.name} />
									</GanttTimelineCell>
								</GanttRow>
							))}
						</GanttBody>
					</Gantt>
				</div>

				{/* With Milestones */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">With Milestones</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">Timeline with milestone markers for key dates.</p>
					<Gantt
						startDate={subDays(today, 5)}
						endDate={addDays(today, 25)}
						columnWidth={35}
						rowHeight={50}
						sidebarWidth={180}
					>
						<GanttHeader />
						<GanttBody>
							<GanttRow>
								<GanttSidebarCell>
									<span className="wwc:text-sm wwc:font-medium">Sprint 1</span>
								</GanttSidebarCell>
								<GanttTimelineCell>
									<GanttBar startDate={subDays(today, 3)} endDate={addDays(today, 4)} color="chart1" label="Sprint 1" />
									<GanttMilestone date={addDays(today, 4)} color="chart1" />
								</GanttTimelineCell>
							</GanttRow>
							<GanttRow>
								<GanttSidebarCell>
									<span className="wwc:text-sm wwc:font-medium">Sprint 2</span>
								</GanttSidebarCell>
								<GanttTimelineCell>
									<GanttBar
										startDate={addDays(today, 5)}
										endDate={addDays(today, 12)}
										color="chart2"
										label="Sprint 2"
									/>
									<GanttMilestone date={addDays(today, 12)} color="chart2" />
								</GanttTimelineCell>
							</GanttRow>
							<GanttRow>
								<GanttSidebarCell>
									<span className="wwc:text-sm wwc:font-medium">Sprint 3</span>
								</GanttSidebarCell>
								<GanttTimelineCell>
									<GanttBar
										startDate={addDays(today, 13)}
										endDate={addDays(today, 18)}
										color="chart3"
										label="Sprint 3"
									/>
									<GanttMilestone date={addDays(today, 18)} color="chart3" />
								</GanttTimelineCell>
							</GanttRow>
							<GanttRow>
								<GanttSidebarCell>
									<span className="wwc:text-sm wwc:font-medium">QA Review</span>
								</GanttSidebarCell>
								<GanttTimelineCell>
									<GanttBar
										startDate={addDays(today, 16)}
										endDate={addDays(today, 20)}
										color="chart4"
										label="QA Review"
									/>
									<GanttMilestone date={addDays(today, 20)} color="chart4" />
								</GanttTimelineCell>
							</GanttRow>
							<GanttRow>
								<GanttSidebarCell>
									<span className="wwc:text-sm wwc:font-medium">Release</span>
								</GanttSidebarCell>
								<GanttTimelineCell>
									<GanttBar
										startDate={addDays(today, 21)}
										endDate={addDays(today, 23)}
										color="chart5"
										label="Release"
									/>
									<GanttMilestone date={addDays(today, 23)} color="chart5" />
								</GanttTimelineCell>
							</GanttRow>
						</GanttBody>
					</Gantt>
				</div>

				{/* API Reference */}
				<Card>
					<CardHeader>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<CardTitle>API Reference</CardTitle>
							<CopyButton
								value="Gantt Chart - API Reference"
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
										{prop: "startDate", type: "Date", def: "—", desc: "Start date of the Gantt chart range."},
										{prop: "endDate", type: "Date", def: "—", desc: "End date of the Gantt chart range."},
										{prop: "columnWidth", type: "number", def: "40", desc: "Width of each day column in pixels."},
										{prop: "rowHeight", type: "number", def: "50", desc: "Height of each row in pixels."},
										{prop: "sidebarWidth", type: "number", def: "300", desc: "Width of the sidebar in pixels."},
										{
											prop: "showTodayLine",
											type: "boolean",
											def: "true",
											desc: "Show a vertical line marking today (GanttBody).",
										},
										{
											prop: "sidebarHeader",
											type: "ReactNode",
											def: "—",
											desc: "Content for the sidebar header area (GanttHeader).",
										},
										{
											prop: "isGroup",
											type: "boolean",
											def: "false",
											desc: "Render the row as a group header (GanttRow).",
										},
										{prop: "startDate (bar)", type: "Date", def: "—", desc: "Task start date (GanttBar)."},
										{prop: "endDate (bar)", type: "Date", def: "—", desc: "Task end date (GanttBar)."},
										{
											prop: "color",
											type: '"default" | "muted" | "accent" | "chart1" | ... | "chart5"',
											def: '"default"',
											desc: "Color variant for bars and milestones.",
										},
										{prop: "progress", type: "number", def: "—", desc: "Progress percentage to display (GanttBar)."},
										{prop: "label", type: "string", def: "—", desc: "Label text inside the bar (GanttBar)."},
										{prop: "showLabel", type: "boolean", def: "true", desc: "Whether to show the label (GanttBar)."},
										{prop: "date", type: "Date", def: "—", desc: "Date position of the milestone (GanttMilestone)."},
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

				{/* Usage */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Usage</h2>
					<div className="wwc:border wwc:rounded-lg">
						<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
							{`import {
  Gantt,
  GanttHeader,
  GanttBody,
  GanttRow,
  GanttSidebarCell,
  GanttTimelineCell,
  GanttBar,
  GanttMilestone,
} from "@/components/ui/gantt"

// Basic Gantt chart
<Gantt
  startDate={startDate}
  endDate={endDate}
  columnWidth={35}
  rowHeight={50}
  sidebarWidth={200}
>
  <GanttHeader />
  <GanttBody>
    <GanttRow>
      <GanttSidebarCell>
        <span>Task Name</span>
      </GanttSidebarCell>
      <GanttTimelineCell>
        <GanttBar
          startDate={taskStart}
          endDate={taskEnd}
          color="chart1"
          label="Task Label"
        />
      </GanttTimelineCell>
    </GanttRow>
  </GanttBody>
</Gantt>

// With milestones
<GanttTimelineCell>
  <GanttBar startDate={start} endDate={end} color="chart2" />
  <GanttMilestone date={milestoneDate} color="chart2" />
</GanttTimelineCell>

// Group row
<GanttRow isGroup>
  <GanttSidebarCell>Group Header</GanttSidebarCell>
  <GanttTimelineCell>...</GanttTimelineCell>
</GanttRow>`}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
