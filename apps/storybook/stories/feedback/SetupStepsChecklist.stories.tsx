import type {Meta, StoryObj} from "storybook/internal/types";

import {SetupStepsChecklist, type SetupStep} from "@wakecap/core-ui/setup-steps-checklist";
import {useState} from "react";

const meta = {
	title: "Widgets/Setup/SetupStepsChecklist",
	component: SetupStepsChecklist,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Multi-step project setup tracker. Each step is a collapsible Card with a chevron, status indicator, label, title, progress ring, count, and an optional header CTA. Expanded steps show a list of sub-items with done / pending status. Drives state via `openIds` (or uncontrolled via `defaultOpenIds`).",
			},
		},
	},
} satisfies Meta<typeof SetupStepsChecklist>;

export default meta;
type Story = StoryObj<typeof meta>;

const fullSteps: SetupStep[] = [
	{
		id: "upload",
		label: "Step 1",
		title: "Upload files",
		completed: 4,
		total: 6,
		countText: "4 of 6 completed",
		items: [
			{
				id: "activities",
				status: "done",
				title: "Activities",
				subtitle: "MR-SF-PH1-Z1-RBL-OO1-v2.xer · 10,726 tasks",
				actions: [
					{id: "update", label: "Update", variant: "ghost"},
					{id: "view", label: "View", variant: "outline"},
				],
			},
			{
				id: "lbs",
				status: "done",
				title: "LBS Objects",
				subtitle: "3,136 objects",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "blueprints",
				status: "done",
				title: "Blueprints",
				subtitle: "51 blueprints uploaded",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "boq",
				status: "done",
				title: "BOQ",
				subtitle: "449 items",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "operations",
				status: "pending",
				title: "Operations",
				subtitle: "Optional operation templates",
				actions: [{id: "upload", label: "Upload", variant: "outline"}],
			},
			{
				id: "mapping",
				status: "pending",
				title: "Activity to LBS Mapping",
				subtitle: "Upload activity-to-LBS mapping file",
				actions: [{id: "upload", label: "Upload", variant: "outline"}],
			},
		],
	},
	{
		id: "blueprints-lbs",
		label: "Step 2",
		title: "Blueprints to LBS",
		description: "Each LBS area needs a blueprint attached",
		completed: 15,
		total: 3136,
		countText: "15 of 3,136 LBS areas",
		action: {label: "Assign Blueprints", variant: "outline"},
	},
	{
		id: "draw",
		label: "Step 3",
		title: "Draw objects",
		description: "Draw shapes on blueprints for zones and rooms",
		completed: 3,
		total: 51,
		countText: "3 of 51 blueprints with shapes",
		action: {label: "Draw objects", variant: "outline"},
	},
	{
		id: "assign",
		label: "Step 4",
		title: "Assign to objects",
		description: "Link activities, operations & BOQ to drawn objects",
		completed: 0,
		total: 8,
		countText: "0 of 8 assigned",
		action: {label: "Assign to objects", variant: "outline"},
	},
];

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<SetupStepsChecklist steps={fullSteps} defaultOpenIds={["upload"]} />
		</div>
	),
};

export const AllCollapsed: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<SetupStepsChecklist steps={fullSteps} />
		</div>
	),
};

export const AllExpanded: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<SetupStepsChecklist steps={fullSteps} defaultOpenIds={fullSteps.map((s) => s.id)} />
		</div>
	),
};

const completedSteps: SetupStep[] = [
	{
		id: "step-1",
		label: "Step 1",
		title: "Upload files",
		completed: 6,
		total: 6,
		countText: "6 of 6 completed",
		items: [
			{id: "activities", status: "done", title: "Activities", subtitle: "10,726 tasks"},
			{id: "lbs", status: "done", title: "LBS Objects", subtitle: "3,136 objects"},
			{id: "blueprints", status: "done", title: "Blueprints", subtitle: "51 blueprints"},
			{id: "boq", status: "done", title: "BOQ", subtitle: "449 items"},
			{id: "operations", status: "done", title: "Operations", subtitle: "12 templates"},
			{id: "mapping", status: "done", title: "Activity to LBS Mapping", subtitle: "Mapped"},
		],
	},
];

export const Completed: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<SetupStepsChecklist steps={completedSteps} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"When `completed >= total`, the indicator becomes a green CircleCheck and the count text turns green. Progress ring fills fully.",
			},
		},
	},
};

export const Controlled: Story = {
	render: () => {
		function Demo() {
			const [openIds, setOpenIds] = useState<string[]>(["upload"]);
			return (
				<div className="wwc:flex wwc:max-w-3xl wwc:flex-col wwc:gap-3">
					<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						openIds: {JSON.stringify(openIds)}
					</div>
					<SetupStepsChecklist steps={fullSteps} openIds={openIds} onOpenIdsChange={setOpenIds} />
				</div>
			);
		}
		return <Demo />;
	},
};
