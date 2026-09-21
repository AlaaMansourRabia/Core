import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@core/core-ui/tooltip";
import {expect, screen, userEvent, waitFor, within} from "storybook/test";

const meta = {
	title: "Components/Overlay/Tooltip",
	component: Tooltip,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Hover me</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>This is a tooltip</p>
			</TooltipContent>
		</Tooltip>
	),
};

export const SideTop: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Top</Button>
			</TooltipTrigger>
			<TooltipContent side="top">
				<p>Tooltip on top</p>
			</TooltipContent>
		</Tooltip>
	),
};

export const SideBottom: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Bottom</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>Tooltip on bottom</p>
			</TooltipContent>
		</Tooltip>
	),
};

export const SideLeft: Story = {
	render: () => (
		<div className="wwc:ml-32">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Left</Button>
				</TooltipTrigger>
				<TooltipContent side="left">
					<p>Tooltip on left</p>
				</TooltipContent>
			</Tooltip>
		</div>
	),
};

export const SideRight: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Right</Button>
			</TooltipTrigger>
			<TooltipContent side="right">
				<p>Tooltip on right</p>
			</TooltipContent>
		</Tooltip>
	),
};

export const AllSides: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-6 wwc:p-12">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Top</Button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>Top tooltip</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Right</Button>
				</TooltipTrigger>
				<TooltipContent side="right">
					<p>Right tooltip</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Bottom</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Bottom tooltip</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Left</Button>
				</TooltipTrigger>
				<TooltipContent side="left">
					<p>Left tooltip</p>
				</TooltipContent>
			</Tooltip>
		</div>
	),
};

export const HoverInteraction: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Hover me</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Tooltip appeared</p>
			</TooltipContent>
		</Tooltip>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", {name: /hover me/i});

		await userEvent.hover(trigger);
		const tooltip = await screen.findByRole("tooltip");
		await waitFor(() => expect(tooltip).toBeVisible());
	},
};
