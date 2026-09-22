import type {Meta, StoryObj} from "storybook/internal/types";

import {WorkItemCard, type WorkItemAssignee} from "@corensystem/core-ui/work-item-card";

const meta = {
	title: "Widgets/Activity/Work Item Card",
	component: WorkItemCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Plane-style work item card. Composable card surface for kanban / backlog views with identifier, title, status, priority, date range, assignees, sub-issue count, modules and labels. Empty attributes render as icon-only placeholder pills so the card preserves a consistent affordance row.",
			},
		},
	},
} satisfies Meta<typeof WorkItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAssignee: WorkItemAssignee = {id: "u1", name: "Layla N.", tone: "success"};
const sampleAssignees: WorkItemAssignee[] = [
	{id: "u1", name: "Ahmed R.", tone: "success"},
	{id: "u2", name: "Maya K.", tone: "primary"},
	{id: "u3", name: "John D.", tone: "warning"},
];

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-sm">
			<WorkItemCard
				identifier="AS123-4"
				title="3. Create and assign Work Items ✏️"
				status="backlog"
				dateRange={{start: "Jun 26", end: "27, 2025"}}
				isOverdue
				labels={[{id: "l1", name: "concepts", tone: "primary"}]}
			/>
		</div>
	),
};

export const Statuses: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-3 wwc:grid-cols-1 wwc:sm:grid-cols-2 wwc:max-w-3xl">
			<WorkItemCard identifier="AS123-1" title="Backlog item" status="backlog" />
			<WorkItemCard identifier="AS123-2" title="Todo item" status="todo" />
			<WorkItemCard
				identifier="AS123-3"
				title="In progress item"
				status="in-progress"
				priority="high"
				assignees={[sampleAssignee]}
			/>
			<WorkItemCard
				identifier="AS123-4"
				title="Done item"
				status="done"
				dateRange={{start: "Aug 03", end: "04, 2025"}}
				assignees={sampleAssignees}
			/>
		</div>
	),
};

export const Priorities: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-3 wwc:grid-cols-1 wwc:sm:grid-cols-2 wwc:max-w-3xl">
			<WorkItemCard identifier="AS-101" title="Low priority task" status="todo" priority="low" />
			<WorkItemCard identifier="AS-102" title="Medium priority task" status="todo" priority="medium" />
			<WorkItemCard identifier="AS-103" title="High priority task" status="in-progress" priority="high" />
			<WorkItemCard identifier="AS-104" title="Urgent priority task" status="in-progress" priority="urgent" />
		</div>
	),
};

export const FullyPopulated: Story = {
	render: () => (
		<div className="wwc:max-w-sm">
			<WorkItemCard
				identifier="AS123-11"
				title="ASMobbin Official (copy)"
				status="in-progress"
				priority="high"
				dateRange={{start: "Aug 14", end: "28, 2025"}}
				assignees={sampleAssignees}
				subIssueCount={3}
				labels={[{id: "l1", name: "admin", tone: "info"}]}
			/>
		</div>
	),
};

export const Blocked: Story = {
	render: () => (
		<div className="wwc:max-w-sm">
			<WorkItemCard
				identifier="AS123-9"
				title="Blocked: waiting on vendor approval"
				status="todo"
				isBlocked
				priority="urgent"
				dateRange={{start: "Aug 24", end: "25, 2025"}}
				isOverdue
			/>
		</div>
	),
};
