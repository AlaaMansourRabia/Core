import type {Meta, StoryObj} from "storybook/internal/types";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@core/core-ui/accordion";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Layout/Accordion",
	component: Accordion,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A vertically stacked set of interactive headings that each reveal a section of content. Built on Radix Accordion with composable sub-components: Accordion, AccordionItem, AccordionTrigger, and AccordionContent.",
			},
		},
	},
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Is it accessible?</AccordionTrigger>
				<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Is it styled?</AccordionTrigger>
				<AccordionContent>
					Yes. It comes with default styles that match the other components&apos; aesthetic.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Is it animated?</AccordionTrigger>
				<AccordionContent>Yes. It animates open and closed by default.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const Multiple: Story = {
	render: () => (
		<Accordion type="multiple" className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>First section</AccordionTrigger>
				<AccordionContent>Multiple items can be open at the same time.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Second section</AccordionTrigger>
				<AccordionContent>Try opening this while the first is still open.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Third section</AccordionTrigger>
				<AccordionContent>All three can be expanded simultaneously.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const DefaultOpen: Story = {
	render: () => (
		<Accordion type="single" collapsible defaultValue="item-2" className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Collapsed by default</AccordionTrigger>
				<AccordionContent>This section is collapsed initially.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Open by default</AccordionTrigger>
				<AccordionContent>This section is expanded when the page loads.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Also collapsed</AccordionTrigger>
				<AccordionContent>This section is also collapsed initially.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const Disabled: Story = {
	render: () => (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Available</AccordionTrigger>
				<AccordionContent>This section can be toggled.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2" disabled>
				<AccordionTrigger>Disabled</AccordionTrigger>
				<AccordionContent>This section cannot be toggled.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Also available</AccordionTrigger>
				<AccordionContent>This section can also be toggled.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
};

export const ExpandCollapseInteraction: Story = {
	render: () => (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Click to expand</AccordionTrigger>
				<AccordionContent>This content is now visible.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", {name: /click to expand/i});

		await expect(trigger).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(trigger);
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await userEvent.click(trigger);
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
	},
};
