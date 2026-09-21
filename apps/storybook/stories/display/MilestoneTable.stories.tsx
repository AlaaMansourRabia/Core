import type {Meta, StoryObj} from "storybook/internal/types";

import {type MilestoneRow, MilestoneTable} from "@wakecap/core-ui/milestone-table";

const MILESTONES: MilestoneRow[] = [
	{id: "M35", color: "#7c3aed", actual: "Aug-26", planned: "Sep-26"},
	{id: "M50", color: "#2563eb", actual: "Nov-26", planned: "Dec-26"},
	{id: "M65", color: "#38bdf8", actual: "Jan-27", planned: "Feb-27"},
	{id: "M80", color: "#5eead4", actual: null, planned: "May-27"},
	{id: "M95", color: "#01b04a", actual: null, planned: "Nov-27"},
	{id: "M100", color: "#42ff01", actual: null, planned: "Dec-27"},
];

const meta = {
	title: "Components/Data Display/Milestone Table",
	component: MilestoneTable,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A milestones table: one row per milestone with a colored swatch + id, its actual date (or “—”), and its planned date, with zebra striping. Collapsible by default (a toggle header shows/hides the table); pass `collapsible={false}` for a static title + table.",
			},
		},
	},
} satisfies Meta<typeof MilestoneTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {milestones: MILESTONES},
	render: (args) => (
		<div className="wwc:w-72">
			<MilestoneTable {...args} />
		</div>
	),
};

export const Static: Story = {
	args: {milestones: MILESTONES, collapsible: false},
	render: (args) => (
		<div className="wwc:w-72">
			<MilestoneTable {...args} />
		</div>
	),
};
