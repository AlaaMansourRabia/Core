import type {Meta, StoryObj} from "storybook/internal/types";

import {SingleHouseView} from "@wakecap/core-ui/single-house-view";

const meta = {
	title: "Components/Data Display/SingleHouseView",
	component: SingleHouseView,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A single-building fragment viewer: an isolatable 3D house model stage (stacked floor slabs you can click to isolate) with an overlay header, control toolbar, and streaming loading veil, beside a floor rail listing each level with status, progress, and workers.",
			},
		},
	},
	argTypes: {
		initialFloorId: {
			control: "select",
			options: ["roof", "l02", "l01", "l00", "found", null],
		},
	},
	args: {
		initialFloorId: "l01",
	},
	decorators: [
		(Story) => (
			<div className="wwc:h-[560px] wwc:w-full wwc:max-w-5xl wwc:p-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SingleHouseView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WholeBuilding: Story = {
	name: "Whole building (no isolation)",
	args: {initialFloorId: null},
};

export const GroundFloorIsolated: Story = {
	name: "Ground floor isolated",
	args: {initialFloorId: "l00"},
};
