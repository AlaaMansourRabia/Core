import type {Meta, StoryObj} from "storybook/internal/types";

import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

const meta = {
	title: "Components/Primitives/Label",
	component: Label,
	tags: ["autodocs"],
	args: {
		children: "Label text",
	},
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
	render: () => (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="email">Email</Label>
			<Input type="email" id="email" placeholder="Email" />
		</div>
	),
};

export const Required: Story = {
	render: () => (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="name">
				Name <span className="wwc:text-destructive">*</span>
			</Label>
			<Input id="name" placeholder="Enter your name" />
		</div>
	),
};

export const PeerDisabled: Story = {
	render: () => (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="disabled-input">Disabled field</Label>
			<Input id="disabled-input" placeholder="Cannot edit" disabled />
		</div>
	),
};
