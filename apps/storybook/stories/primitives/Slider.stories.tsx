import type {Meta, StoryObj} from "storybook/internal/types";

import {Slider} from "@corensystem/core-ui/slider";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Slider",
	component: Slider,
	tags: ["autodocs"],
	argTypes: {
		defaultValue: {control: "object"},
		max: {control: "number"},
		min: {control: "number"},
		step: {control: "number"},
		disabled: {control: "boolean"},
	},
	args: {
		defaultValue: [50],
		max: 100,
		min: 0,
		step: 1,
		disabled: false,
	},
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomRange: Story = {
	args: {defaultValue: [25], min: 0, max: 100, step: 5},
};

export const SmallStep: Story = {
	args: {defaultValue: [0.5], min: 0, max: 1, step: 0.1},
};

export const Disabled: Story = {
	args: {disabled: true, defaultValue: [50]},
};

export const WithLabel: Story = {
	render: () => (
		<div className="wwc:space-y-2 wwc:w-[300px]">
			<div className="wwc:flex wwc:justify-between wwc:text-sm">
				<span>Volume</span>
				<span className="wwc:text-muted-foreground">75%</span>
			</div>
			<Slider defaultValue={[75]} max={100} step={1} />
		</div>
	),
};

export const KeyboardInteraction: Story = {
	args: {defaultValue: [50], max: 100, step: 1},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const slider = canvas.getByRole("slider");

		await slider.focus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(slider).toHaveAttribute("aria-valuenow", "51");
	},
};
