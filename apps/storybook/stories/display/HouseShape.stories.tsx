import type {Meta, StoryObj} from "storybook/internal/types";

import {HouseShape} from "@core/core-ui/house-shape";

const meta = {
	title: "Components/Data Display/HouseShape",
	component: HouseShape,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "accent", "muted", "destructive"],
		},
		state: {
			control: "select",
			options: ["idle", "hovered", "selected"],
		},
		size: {control: {type: "number"}},
		wall: {control: {type: "number"}},
		roof: {control: {type: "number"}},
	},
	args: {
		name: "Block A",
		variant: "primary",
		state: "idle",
	},
	parameters: {
		docs: {
			description: {
				component:
					"An isometric SVG house tile for blueprint / site navigators. Palette is driven by the `variant` token colour; `state` controls the hover-lift and selected marker.",
			},
		},
	},
} satisfies Meta<typeof HouseShape>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => <HouseShape {...args} className="wwc:h-40 wwc:w-40" />,
};

export const Selected: Story = {
	args: {state: "selected"},
	render: (args) => <HouseShape {...args} className="wwc:h-40 wwc:w-40" />,
};

export const AllVariants: Story = {
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-end wwc:gap-6">
			{(["primary", "secondary", "accent", "muted", "destructive"] as const).map((variant) => (
				<HouseShape key={variant} name={variant} variant={variant} className="wwc:h-28 wwc:w-28" />
			))}
		</div>
	),
};

export const AllStates: Story = {
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-end wwc:gap-6">
			{(["idle", "hovered", "selected"] as const).map((state) => (
				<HouseShape key={state} name={state} state={state} className="wwc:h-28 wwc:w-28" />
			))}
		</div>
	),
};
