import type {Meta, StoryObj} from "storybook/internal/types";

import {ToolbarStats, type ToolbarStat} from "@core/core-ui/toolbar-stats";

const EV_GROUPS: ToolbarStat[][] = [
	[
		{label: "APPROVED", value: "0%"},
		{label: "PLANNED", value: "26.48%"},
		{label: "VARIANCE", value: "-26.48%", negative: true},
	],
	[
		{label: "BAC", value: "$551,117,394"},
		{label: "EV", value: "$0"},
		{label: "PV", value: "$145,921,414"},
		{label: "SV", value: "-$145,921,414", negative: true},
	],
];

const SINGLE_GROUP: ToolbarStat[][] = [
	[
		{label: "WORKERS", value: "342"},
		{label: "ON SITE", value: "318"},
		{label: "ABSENT", value: "-24", negative: true},
	],
];

const meta = {
	title: "Widgets/Analytics/Toolbar Stats",
	component: ToolbarStats,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A full-width toolbar of labeled metric tiles — a caption over a bold value, one bordered `stat` card each, spread to equal widths. Pass `groups` to split the row into divider-separated sections (e.g. percentage metrics from currency ones). Values flagged `negative` render in the destructive color.",
			},
		},
	},
	args: {
		groups: EV_GROUPS,
	},
	render: (args) => (
		<div className="wwc:w-full wwc:max-w-4xl">
			<ToolbarStats {...args} />
		</div>
	),
} satisfies Meta<typeof ToolbarStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		groups: EV_GROUPS,
	},
};

export const Table: Story = {
	args: {
		groups: EV_GROUPS,
		variant: "table",
	},
};

export const SingleGroup: Story = {
	args: {
		groups: SINGLE_GROUP,
	},
};
