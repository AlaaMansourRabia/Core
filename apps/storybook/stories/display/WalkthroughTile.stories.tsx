import type {Meta, StoryObj} from "storybook/internal/types";

import {WalkthroughTile} from "@core/core-ui/walkthrough-tile";

const meta = {
	title: "Components/Data Display/WalkthroughTile",
	component: WalkthroughTile,
	tags: ["autodocs"],
	argTypes: {
		aspect: {control: "select", options: ["video", "square", "portrait"]},
	},
	args: {
		aspect: "video",
	},
	parameters: {
		docs: {
			description: {
				component:
					"An autoplaying, muted walkthrough clip with hover-revealed play/pause and a fullscreen control. Plays at half speed for slow inspection.",
			},
		},
	},
} satisfies Meta<typeof WalkthroughTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<div className="wwc:w-[420px]">
			<WalkthroughTile {...args} />
		</div>
	),
};

export const AllVariants: Story = {
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:gap-4">
			<div className="wwc:w-[280px]">
				<WalkthroughTile aspect="video" />
			</div>
			<div className="wwc:w-[220px]">
				<WalkthroughTile aspect="square" />
			</div>
			<div className="wwc:w-[200px]">
				<WalkthroughTile aspect="portrait" />
			</div>
		</div>
	),
};
