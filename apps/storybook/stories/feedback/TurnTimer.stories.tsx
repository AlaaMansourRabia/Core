import type {Meta, StoryObj} from "storybook/internal/types";

import {TurnTimer} from "@corensystem/core-ui/turn-timer";

const meta = {
	title: "Components/Feedback/Turn Timer",
	component: TurnTimer,
	tags: ["autodocs"],
	argTypes: {
		done: {control: "boolean"},
		value: {control: "text"},
		tickIntervalMs: {control: "number"},
	},
	args: {
		done: false,
	},
	parameters: {
		docs: {
			description: {
				component:
					"Mono-text duration counter. Live during work (spinning ring + ticking), frozen + de-emphasised when complete (solid 4px dim dot, 70% opacity). Sits as a footnote beneath the result it timed.",
			},
		},
	},
} satisfies Meta<typeof TurnTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {
	render: () => <TurnTimer />,
	parameters: {
		docs: {
			description: {story: "Live state — ticks every 100ms, spinning ring dot, full opacity."},
		},
	},
};

export const Done: Story = {
	args: {done: true, value: "8.5s"},
	parameters: {
		docs: {
			description: {story: "Done state — solid 4px dim dot, no animation, frozen final duration, 70% opacity."},
		},
	},
};

export const DoneValues: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-4">
			<TurnTimer done value="0.4s" />
			<TurnTimer done value="2.4s" />
			<TurnTimer done value="8.5s" />
			<TurnTimer done value="12.7s" />
			<TurnTimer done value="42.0s" />
		</div>
	),
};

export const SideBySide: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-4">
				<span className="wwc:w-16 wwc:text-xs wwc:text-muted-foreground">Live:</span>
				<TurnTimer />
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-4">
				<span className="wwc:w-16 wwc:text-xs wwc:text-muted-foreground">Done:</span>
				<TurnTimer done value="8.5s" />
			</div>
		</div>
	),
};
