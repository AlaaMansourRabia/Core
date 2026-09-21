import type {Meta, StoryObj} from "storybook/internal/types";

import {Separator} from "@wakecap/core-ui/separator";

const meta = {
	title: "Components/Primitives/Separator",
	component: Separator,
	tags: ["autodocs"],
	argTypes: {
		orientation: {
			control: "select",
			options: ["horizontal", "vertical"],
		},
		decorative: {control: "boolean"},
	},
	args: {
		orientation: "horizontal",
		decorative: true,
	},
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = {
	render: () => (
		<div className="wwc:w-[300px]">
			<div className="wwc:space-y-1">
				<h4 className="wwc:text-sm wwc:font-medium wwc:leading-none">Wakecore UI</h4>
				<p className="wwc:text-sm wwc:text-muted-foreground">An open-source UI component library.</p>
			</div>
			<Separator className="wwc:my-4" />
			<div className="wwc:flex wwc:h-5 wwc:items-center wwc:space-x-4 wwc:text-sm">
				<div>Docs</div>
				<Separator orientation="vertical" />
				<div>Source</div>
				<Separator orientation="vertical" />
				<div>Changelog</div>
			</div>
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="wwc:flex wwc:h-5 wwc:items-center wwc:space-x-4 wwc:text-sm">
			<div>Blog</div>
			<Separator orientation="vertical" />
			<div>Docs</div>
			<Separator orientation="vertical" />
			<div>Source</div>
		</div>
	),
};
