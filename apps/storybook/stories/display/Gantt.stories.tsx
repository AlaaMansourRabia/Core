import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@corensystem/core-ui/badge";
import {
	Gantt,
	GanttBar,
	GanttBody,
	GanttHeader,
	GanttMilestone,
	GanttRow,
	GanttSidebarCell,
	GanttTimelineCell,
} from "@corensystem/core-ui/gantt";
import {addDays} from "date-fns";

const meta = {
	title: "Widgets/Schedule/Gantt",
	component: Gantt,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Gantt chart for project timeline visualization. Compound component with fixed sidebar and scrollable timeline. Supports task bars, milestones, today line, progress indicators, group rows, and multi-task resource views.",
			},
		},
	},
} satisfies Meta<typeof Gantt>;

export default meta;
type Story = StoryObj<typeof meta>;

// Fixed base date for deterministic snapshots
const base = new Date(2026, 3, 1); // April 1, 2026
const chartStart = addDays(base, -10);
const chartEnd = addDays(base, 35);

// ── Team Resource View ──

const teamMembers = [
	{
		id: "1",
		name: "John Smith",
		initials: "JS",
		department: "Marketing",
		tasks: [
			{
				id: "t1",
				name: "Front end development 2.0",
				startDate: addDays(base, -8),
				endDate: addDays(base, 5),
				color: "chart1" as const,
			},
			{
				id: "t2",
				name: "API Integration",
				startDate: addDays(base, 2),
				endDate: addDays(base, 12),
				color: "chart2" as const,
			},
			{
				id: "t3",
				name: "Testing phase",
				startDate: addDays(base, 8),
				endDate: addDays(base, 18),
				color: "chart3" as const,
			},
		],
	},
	{
		id: "2",
		name: "Ariel Castaneda",
		initials: "AC",
		department: "Marketing",
		tasks: [
			{id: "t4", name: "UI Design", startDate: addDays(base, 3), endDate: addDays(base, 15), color: "chart1" as const},
			{
				id: "t5",
				name: "User Research",
				startDate: addDays(base, 10),
				endDate: addDays(base, 20),
				color: "chart2" as const,
			},
			{
				id: "t6",
				name: "Prototyping",
				startDate: addDays(base, 15),
				endDate: addDays(base, 25),
				color: "chart4" as const,
			},
		],
	},
	{
		id: "3",
		name: "Edward Coleman",
		initials: "EC",
		department: "Product Desktop",
		tasks: [
			{
				id: "t7",
				name: "Backend development",
				startDate: addDays(base, -2),
				endDate: addDays(base, 8),
				color: "chart3" as const,
			},
			{
				id: "t8",
				name: "Database optimization",
				startDate: addDays(base, 5),
				endDate: addDays(base, 12),
				color: "chart5" as const,
			},
			{
				id: "t9",
				name: "Security audit",
				startDate: addDays(base, 10),
				endDate: addDays(base, 16),
				color: "chart4" as const,
			},
		],
	},
	{
		id: "4",
		name: "Watson Ponce",
		initials: "WP",
		department: "Product Mobile",
		tasks: [
			{
				id: "t10",
				name: "Mobile app development",
				startDate: addDays(base, 5),
				endDate: addDays(base, 22),
				color: "chart2" as const,
			},
			{
				id: "t11",
				name: "Push notifications",
				startDate: addDays(base, 15),
				endDate: addDays(base, 20),
				color: "chart1" as const,
			},
			{
				id: "t12",
				name: "App store submission",
				startDate: addDays(base, 20),
				endDate: addDays(base, 25),
				color: "default" as const,
			},
		],
	},
];

export const TeamResourceView: Story = {
	render: () => (
		<Gantt startDate={chartStart} endDate={chartEnd} columnWidth={35} rowHeight={120} sidebarWidth={280}>
			<GanttHeader />
			<GanttBody>
				{teamMembers.map((member) => (
					<GanttRow key={member.id}>
						<GanttSidebarCell>
							<div className="wwc:flex wwc:items-start wwc:gap-3 wwc:w-full">
								<div className="wwc:h-8 wwc:w-8 wwc:mt-0.5 wwc:rounded-full wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center wwc:text-xs wwc:font-medium wwc:shrink-0">
									{member.initials}
								</div>
								<div className="wwc:flex-1 wwc:min-w-0">
									<span className="wwc:font-medium wwc:text-sm wwc:truncate wwc:block">{member.name}</span>
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
	),
};

// ── Project Task View ──

const projectTasks = [
	{
		id: "g1",
		name: "Project Kickoff & Planning",
		status: "Completed",
		tasks: [
			{
				id: "pt1",
				name: "Define project objectives",
				status: "Completed",
				startDate: addDays(base, -8),
				endDate: addDays(base, -5),
				color: "chart3" as const,
			},
			{
				id: "pt2",
				name: "Identify target audience",
				status: "Completed",
				startDate: addDays(base, -5),
				endDate: addDays(base, -2),
				color: "chart3" as const,
			},
		],
	},
	{
		id: "g2",
		name: "Research and Analysis",
		status: "Completed",
		tasks: [
			{
				id: "pt3",
				name: "Conduct user research",
				status: "Completed",
				startDate: addDays(base, -2),
				endDate: base,
				color: "chart3" as const,
			},
			{
				id: "pt4",
				name: "Analyze competitors",
				status: "Completed",
				startDate: addDays(base, -1),
				endDate: addDays(base, 1),
				color: "chart3" as const,
			},
			{
				id: "pt5",
				name: "Create user personas",
				status: "Pending",
				startDate: addDays(base, 2),
				endDate: addDays(base, 8),
				color: "chart3" as const,
			},
		],
	},
	{
		id: "g3",
		name: "Visual Design",
		status: "In progress",
		tasks: [
			{
				id: "pt6",
				name: "Develop visual style",
				status: "In progress",
				startDate: addDays(base, 5),
				endDate: addDays(base, 10),
				color: "chart2" as const,
			},
			{
				id: "pt7",
				name: "Create high-fidelity mockups",
				status: "Pending",
				startDate: addDays(base, 8),
				endDate: addDays(base, 15),
				color: "chart3" as const,
			},
		],
	},
];

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
	if (status === "Completed") return "default";
	if (status === "In progress") return "secondary";
	return "outline";
}

export const ProjectTaskView: Story = {
	render: () => (
		<Gantt
			startDate={addDays(base, -10)}
			endDate={addDays(base, 35)}
			columnWidth={40}
			rowHeight={44}
			sidebarWidth={400}
		>
			<GanttHeader />
			<GanttBody>
				{projectTasks.flatMap((group) => [
					<GanttRow key={group.id} isGroup>
						<GanttSidebarCell className="wwc:p-0">
							<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:w-full wwc:h-full wwc:px-3">
								<span className="wwc:font-medium wwc:text-sm">{group.name}</span>
							</div>
						</GanttSidebarCell>
						<GanttTimelineCell>
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
					</GanttRow>,
					...group.tasks.map((task) => (
						<GanttRow key={task.id}>
							<GanttSidebarCell className="wwc:p-0">
								<div className="wwc:flex wwc:items-stretch wwc:w-full wwc:h-full">
									<div className="wwc:flex-1 wwc:pl-7 wwc:px-3 wwc:flex wwc:items-center wwc:gap-2 wwc:min-w-0">
										<div className="wwc:w-4 wwc:h-4 wwc:rounded-full wwc:border-2 wwc:border-muted-foreground/30 wwc:shrink-0" />
										<span className="wwc:text-sm wwc:truncate">{task.name}</span>
									</div>
									<div className="wwc:w-24 wwc:px-3 wwc:border-l wwc:shrink-0 wwc:flex wwc:items-center">
										<Badge variant={getStatusVariant(task.status)} className="wwc:text-[10px] wwc:h-5">
											{task.status}
										</Badge>
									</div>
								</div>
							</GanttSidebarCell>
							<GanttTimelineCell>
								<GanttBar startDate={task.startDate} endDate={task.endDate} color={task.color} showLabel={false} />
							</GanttTimelineCell>
						</GanttRow>
					)),
				])}
			</GanttBody>
		</Gantt>
	),
};

// ── Simple Timeline ──

export const SimpleTimeline: Story = {
	render: () => (
		<Gantt startDate={addDays(base, -5)} endDate={addDays(base, 25)} columnWidth={30} rowHeight={50} sidebarWidth={200}>
			<GanttHeader />
			<GanttBody>
				{[
					{id: "s1", name: "Planning", startDate: addDays(base, -3), endDate: base, color: "chart1" as const},
					{id: "s2", name: "Design", startDate: addDays(base, 1), endDate: addDays(base, 7), color: "chart2" as const},
					{
						id: "s3",
						name: "Development",
						startDate: addDays(base, 5),
						endDate: addDays(base, 18),
						color: "chart3" as const,
					},
					{
						id: "s4",
						name: "Testing",
						startDate: addDays(base, 15),
						endDate: addDays(base, 22),
						color: "chart4" as const,
					},
					{
						id: "s5",
						name: "Launch",
						startDate: addDays(base, 22),
						endDate: addDays(base, 24),
						color: "chart5" as const,
					},
					{
						id: "s6",
						name: "Marketing",
						startDate: addDays(base, 10),
						endDate: addDays(base, 20),
						color: "default" as const,
					},
					{
						id: "s7",
						name: "Documentation",
						startDate: addDays(base, 8),
						endDate: addDays(base, 16),
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
	),
};

// ── With Milestones ──

export const WithMilestones: Story = {
	render: () => (
		<Gantt startDate={addDays(base, -5)} endDate={addDays(base, 25)} columnWidth={35} rowHeight={50} sidebarWidth={180}>
			<GanttHeader />
			<GanttBody>
				{[
					{name: "Sprint 1", start: addDays(base, -3), end: addDays(base, 4), color: "chart1" as const},
					{name: "Sprint 2", start: addDays(base, 5), end: addDays(base, 12), color: "chart2" as const},
					{name: "Sprint 3", start: addDays(base, 13), end: addDays(base, 18), color: "chart3" as const},
					{name: "QA Review", start: addDays(base, 16), end: addDays(base, 20), color: "chart4" as const},
					{name: "Release", start: addDays(base, 21), end: addDays(base, 23), color: "chart5" as const},
				].map((item) => (
					<GanttRow key={item.name}>
						<GanttSidebarCell>
							<span className="wwc:text-sm wwc:font-medium">{item.name}</span>
						</GanttSidebarCell>
						<GanttTimelineCell>
							<GanttBar startDate={item.start} endDate={item.end} color={item.color} label={item.name} />
							<GanttMilestone date={item.end} color={item.color} />
						</GanttTimelineCell>
					</GanttRow>
				))}
			</GanttBody>
		</Gantt>
	),
};

// ── With Progress ──

export const WithProgress: Story = {
	render: () => (
		<Gantt startDate={chartStart} endDate={chartEnd} columnWidth={35} sidebarWidth={200}>
			<GanttHeader sidebarHeader={<span className="wwc:text-sm wwc:font-medium">Tasks</span>} />
			<GanttBody>
				{[
					{name: "Planning", start: base, end: addDays(base, 5), color: "chart1" as const, progress: 100},
					{name: "Design", start: addDays(base, 3), end: addDays(base, 10), color: "chart2" as const, progress: 75},
					{
						name: "Development",
						start: addDays(base, 8),
						end: addDays(base, 22),
						color: "chart3" as const,
						progress: 40,
					},
					{name: "Testing", start: addDays(base, 20), end: addDays(base, 28), color: "chart4" as const, progress: 0},
				].map((task) => (
					<GanttRow key={task.name}>
						<GanttSidebarCell>
							<span className="wwc:text-sm">{task.name}</span>
						</GanttSidebarCell>
						<GanttTimelineCell>
							<GanttBar
								startDate={task.start}
								endDate={task.end}
								color={task.color}
								label={task.name}
								progress={task.progress}
							/>
						</GanttTimelineCell>
					</GanttRow>
				))}
			</GanttBody>
		</Gantt>
	),
};
