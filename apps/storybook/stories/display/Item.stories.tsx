import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Item, ItemContent, ItemDescription, ItemTitle} from "@corensystem/coren-ui/item";

const meta = {
	title: "Components/Data Display/Item",
	component: Item,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A simple layout compound component for displaying items with a title, description, and optional trailing content. Composed of Item, ItemContent, ItemTitle, and ItemDescription.",
			},
		},
	},
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Item>
			<ItemContent>
				<ItemTitle>Item Title</ItemTitle>
				<ItemDescription>This is the item description text.</ItemDescription>
			</ItemContent>
		</Item>
	),
};

export const WithAction: Story = {
	render: () => (
		<Item>
			<ItemContent>
				<ItemTitle>Notification Settings</ItemTitle>
				<ItemDescription>Manage how you receive notifications.</ItemDescription>
			</ItemContent>
			<Button variant="outline" size="sm">
				Edit
			</Button>
		</Item>
	),
};

export const List: Story = {
	render: () => (
		<div className="wwc:divide-y">
			<Item>
				<ItemContent>
					<ItemTitle>Email Notifications</ItemTitle>
					<ItemDescription>Receive email updates for important events.</ItemDescription>
				</ItemContent>
				<Button variant="outline" size="sm">
					Configure
				</Button>
			</Item>
			<Item>
				<ItemContent>
					<ItemTitle>Push Notifications</ItemTitle>
					<ItemDescription>Get push notifications on your mobile device.</ItemDescription>
				</ItemContent>
				<Button variant="outline" size="sm">
					Configure
				</Button>
			</Item>
			<Item>
				<ItemContent>
					<ItemTitle>SMS Alerts</ItemTitle>
					<ItemDescription>Receive text messages for critical alerts.</ItemDescription>
				</ItemContent>
				<Button variant="outline" size="sm">
					Configure
				</Button>
			</Item>
		</div>
	),
};

export const TitleOnly: Story = {
	render: () => (
		<Item>
			<ItemContent>
				<ItemTitle>Simple item with title only</ItemTitle>
			</ItemContent>
		</Item>
	),
};
