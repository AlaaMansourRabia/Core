import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

const meta = {
	title: "Components/Overlay/Popover",
	component: Popover,
	tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Open Popover</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="wwc:grid wwc:gap-4">
					<div className="wwc:space-y-2">
						<h4 className="wwc:font-medium wwc:leading-none">Dimensions</h4>
						<p className="wwc:text-sm wwc:text-muted-foreground">Set the dimensions for the layer.</p>
					</div>
					<div className="wwc:grid wwc:gap-2">
						<div className="wwc:grid wwc:grid-cols-3 wwc:items-center wwc:gap-4">
							<label htmlFor="width" className="wwc:text-sm">
								Width
							</label>
							<input
								id="width"
								defaultValue="100%"
								className="wwc:col-span-2 wwc:rounded-md wwc:border wwc:px-3 wwc:py-1.5 wwc:text-sm"
							/>
						</div>
						<div className="wwc:grid wwc:grid-cols-3 wwc:items-center wwc:gap-4">
							<label htmlFor="height" className="wwc:text-sm">
								Height
							</label>
							<input
								id="height"
								defaultValue="25px"
								className="wwc:col-span-2 wwc:rounded-md wwc:border wwc:px-3 wwc:py-1.5 wwc:text-sm"
							/>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	),
};

export const SimpleText: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Info</Button>
			</PopoverTrigger>
			<PopoverContent>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					This is a simple popover with text content. It anchors to the trigger element.
				</p>
			</PopoverContent>
		</Popover>
	),
};

export const AlignCenter: Story = {
	render: () => (
		<div className="wwc:flex wwc:justify-center">
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Center Aligned</Button>
				</PopoverTrigger>
				<PopoverContent align="center">
					<p className="wwc:text-sm wwc:text-muted-foreground">This popover is center-aligned with its trigger.</p>
				</PopoverContent>
			</Popover>
		</div>
	),
};

export const AlignEnd: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">End Aligned</Button>
			</PopoverTrigger>
			<PopoverContent align="end">
				<p className="wwc:text-sm wwc:text-muted-foreground">This popover is end-aligned with its trigger.</p>
			</PopoverContent>
		</Popover>
	),
};
