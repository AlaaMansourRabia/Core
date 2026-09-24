import type {Meta, StoryObj} from "storybook/internal/types";

import {CompareBars} from "@corensystem/coren-ui/compare-bars";

const meta = {
	title: "Components/Data Display/Compare Bars",
	component: CompareBars,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"The dual-bar comparison primitive: two hero percentages (primary vs secondary) with a variance pill between them, a two-item legend, and a pair of stacked progress bars. This is the presentational core shared by the `ProgressComparison` widget — use it directly when you just need the bars block without the surrounding card/stats/header.",
			},
		},
	},
	argTypes: {size: {control: "inline-radio", options: ["compact", "default"]}},
} satisfies Meta<typeof CompareBars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {primary: {label: "Approved", value: 83}, secondary: {label: "Planned", value: 89}, size: "compact"},
	render: (args) => (
		<div className="wwc:w-72">
			<CompareBars {...args} />
		</div>
	),
};

export const Ahead: Story = {
	args: {primary: {label: "Approved", value: 72}, secondary: {label: "Planned", value: 60}, size: "default"},
	render: (args) => (
		<div className="wwc:w-80">
			<CompareBars {...args} />
		</div>
	),
};
