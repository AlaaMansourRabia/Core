import type {Meta, StoryObj} from "storybook/internal/types";

import {List, ListItem} from "@corensystem/core-ui/list";

const meta = {
	title: "Components/Primitives/List",
	component: List,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<List>
			<ListItem>First item</ListItem>
			<ListItem>Second item</ListItem>
			<ListItem>Third item</ListItem>
		</List>
	),
};

export const Divided: Story = {
	render: () => (
		<List divided>
			<ListItem>Item with divider below</ListItem>
			<ListItem>Another item with divider</ListItem>
			<ListItem>Last item</ListItem>
		</List>
	),
};

export const Ordered: Story = {
	render: () => (
		<List ordered>
			<ListItem>First step</ListItem>
			<ListItem>Second step</ListItem>
			<ListItem>Third step</ListItem>
		</List>
	),
};

export const Interactive: Story = {
	render: () => (
		<List divided>
			<ListItem interactive onClick={() => alert("Item 1 clicked")}>
				Click me - Item 1
			</ListItem>
			<ListItem interactive onClick={() => alert("Item 2 clicked")}>
				Click me - Item 2
			</ListItem>
			<ListItem interactive onClick={() => alert("Item 3 clicked")}>
				Click me - Item 3
			</ListItem>
		</List>
	),
};
