import type {Meta, StoryObj} from "storybook/internal/types";

import {ImageZoom} from "@corensystem/core-ui/image-zoom";

const meta = {
	title: "Components/Data Display/Image Zoom",
	component: ImageZoom,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A thumbnail that opens the full image in a large modal on click, with a maximize hint on hover. " +
					"Use for plans, blueprints, screenshots, or any image worth inspecting at full size.",
			},
		},
	},
} satisfies Meta<typeof ImageZoom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-sm">
			<ImageZoom
				src="/images/floor-plan.png"
				alt="Ground floor plan"
				title="Ground floor — plan"
				className="wwc:rounded-md wwc:border wwc:border-border wwc:bg-white"
			/>
		</div>
	),
};
