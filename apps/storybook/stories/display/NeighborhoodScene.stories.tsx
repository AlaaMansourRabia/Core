import type {Meta, StoryObj} from "storybook/internal/types";

import {NeighborhoodScene} from "@corensystem/core-ui/neighborhood-scene";

const meta = {
	title: "Components/Data Display/NeighborhoodScene",
	component: NeighborhoodScene,
	tags: ["autodocs"],
	argTypes: {
		fit: {
			control: "select",
			options: ["contain", "full"],
		},
		selectedId: {control: "text"},
	},
	args: {
		fit: "contain",
		selectedId: null,
	},
	parameters: {
		docs: {
			description: {
				component:
					"An isometric SVG neighborhood plan — ground, roads and interactive house hit-shapes with idle / hover / selected states. Use `fit` to size the plan inside its container and `selectedId` to highlight a house.",
			},
		},
	},
} satisfies Meta<typeof NeighborhoodScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Full: Story = {args: {fit: "full"}};

export const Selected: Story = {args: {selectedId: "house-1-1"}};

export const AllVariants: Story = {
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-8">
			<NeighborhoodScene fit="contain" />
			<NeighborhoodScene fit="full" />
		</div>
	),
};
