import type {Meta, StoryObj} from "storybook/internal/types";

import {ScheduleWeekBar} from "@corensystem/coren-ui/schedule-week-bar";
import {fn} from "storybook/test";

const meta = {
	title: "Components/Data Display/ScheduleWeekBar",
	component: ScheduleWeekBar,
	tags: ["autodocs"],
	argTypes: {
		variant: {control: "select", options: ["frosted", "plain"]},
	},
	args: {
		variant: "frosted",
		onPlay: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					"A compact week stepper: a week label, prev / next paging, and a 4D-timeline play trigger. Pages through the schedule defined by `meta` and starts on the week containing today.",
			},
		},
	},
} satisfies Meta<typeof ScheduleWeekBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<div className="wwc:max-w-[320px]">
			<ScheduleWeekBar {...args} />
		</div>
	),
};

export const Plain: Story = {
	args: {variant: "plain"},
	render: (args) => (
		<div className="wwc:max-w-[320px]">
			<ScheduleWeekBar {...args} />
		</div>
	),
};

export const AllVariants: Story = {
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:max-w-[320px] wwc:flex-col wwc:gap-4 wwc:bg-muted wwc:p-6">
			<ScheduleWeekBar variant="frosted" onPlay={fn()} />
			<ScheduleWeekBar variant="plain" onPlay={fn()} />
		</div>
	),
};
