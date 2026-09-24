import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Section} from "@corensystem/coren-ui/section";
import {Text} from "@corensystem/coren-ui/text";

const meta = {
	title: "Components/Primitives/Section",
	component: Section,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Section title="Section Title">
			<Text>This is the section content.</Text>
		</Section>
	),
};

export const WithDescription: Story = {
	render: () => (
		<Section title="Profile Settings" description="Manage your account and profile information">
			<Text>Section content goes here.</Text>
		</Section>
	),
};

export const WithActions: Story = {
	render: () => (
		<Section
			title="Team Members"
			description="Manage who has access to this project"
			actions={
				<>
					<Button variant="outline" size="sm">
						View All
					</Button>
					<Button size="sm">Add Member</Button>
				</>
			}
		>
			<Text>List of team members would go here.</Text>
		</Section>
	),
};

export const Multiple: Story = {
	render: () => (
		<div className="wwc:space-y-8">
			<Section title="General" description="Basic settings for your account">
				<div className="wwc:space-y-4 wwc:bg-muted wwc:p-4 wwc:rounded">
					<Text>General settings content</Text>
				</div>
			</Section>
			<Section title="Security" description="Manage your password and security settings">
				<div className="wwc:space-y-4 wwc:bg-muted wwc:p-4 wwc:rounded">
					<Text>Security settings content</Text>
				</div>
			</Section>
			<Section title="Notifications" description="Choose what notifications you receive">
				<div className="wwc:space-y-4 wwc:bg-muted wwc:p-4 wwc:rounded">
					<Text>Notification settings content</Text>
				</div>
			</Section>
		</div>
	),
};
