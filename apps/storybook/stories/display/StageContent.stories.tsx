import type {Meta, StoryObj} from "storybook/internal/types";

import {StageContent} from "@corensystem/coren-ui/stage-content";

const meta = {
	title: "Components/Data Display/StageContent",
	component: StageContent,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A fragment/3D viewer stage: a main canvas with an overlay header, floating viewer toggles (Workers / GLB / Head parallax / 4D), a loading veil while fragments resolve, a floor/section rail with per-storey progress, and a 4D construction-timeline scrubber. Fully self-driven from mock data — pass `initialFloorId` to pre-emphasise a storey and `onSettled` to learn when the model finished loading.",
			},
		},
	},
	argTypes: {
		initialFloorId: {
			control: "select",
			options: [null, "lvl-04", "lvl-03", "lvl-02", "lvl-01", "lvl-00"],
		},
		onSettled: {action: "settled"},
	},
	args: {
		initialFloorId: null,
	},
	decorators: [
		(Story) => (
			<div className="wwc:h-[560px] wwc:w-full">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof StageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Arriving from a site part-click: a storey is emphasised the moment the model settles.
export const PreselectedFloor: Story = {
	args: {initialFloorId: "lvl-02"},
};
