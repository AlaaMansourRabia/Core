import type {Meta, StoryObj} from "storybook/internal/types";

import {Divider} from "@corensystem/core-ui/divider";

const meta = {
	title: "Components/Primitives/Divider",
	component: Divider,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
	render: () => (
		<div className="wwc:space-y-4 wwc:py-4">
			<p className="wwc:text-sm">Content above divider</p>
			<Divider />
			<p className="wwc:text-sm">Content below divider</p>
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4 wwc:h-12">
			<span className="wwc:text-sm">Left</span>
			<Divider orientation="vertical" />
			<span className="wwc:text-sm">Middle</span>
			<Divider orientation="vertical" />
			<span className="wwc:text-sm">Right</span>
		</div>
	),
};
