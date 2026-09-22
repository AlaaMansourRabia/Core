import type {Meta, StoryObj} from "storybook/internal/types";

import {ClickableCard} from "@core/core-ui/clickable-card";
import {FileText, Settings, User} from "lucide-react";

const meta = {
	title: "Components/Primitives/ClickableCard",
	component: ClickableCard,
	tags: ["autodocs"],
} satisfies Meta<typeof ClickableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<ClickableCard className="wwc:w-64" onClick={() => alert("Clicked!")}>
			<div>
				<h3 className="wwc:font-semibold">Click Me</h3>
				<p className="wwc:text-sm wwc:text-muted-foreground">This is a clickable card</p>
			</div>
		</ClickableCard>
	),
};

export const WithChevron: Story = {
	render: () => (
		<div className="wwc:space-y-2 wwc:max-w-sm">
			<ClickableCard showChevron leftSlot={<User className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />}>
				<div>
					<h3 className="wwc:font-medium">Profile Settings</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground">Manage your profile</p>
				</div>
			</ClickableCard>
			<ClickableCard showChevron leftSlot={<Settings className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />}>
				<div>
					<h3 className="wwc:font-medium">Account Settings</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground">Security and preferences</p>
				</div>
			</ClickableCard>
			<ClickableCard showChevron leftSlot={<FileText className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />}>
				<div>
					<h3 className="wwc:font-medium">Documents</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground">View your files</p>
				</div>
			</ClickableCard>
		</div>
	),
};

export const AsLink: Story = {
	render: () => (
		<ClickableCard href="https://example.com" target="_blank" showChevron className="wwc:w-64">
			<div>
				<h3 className="wwc:font-semibold">External Link</h3>
				<p className="wwc:text-sm wwc:text-muted-foreground">Opens in new tab</p>
			</div>
		</ClickableCard>
	),
};

export const Variants: Story = {
	render: () => (
		<div className="wwc:space-y-4 wwc:max-w-sm">
			<ClickableCard variant="default">
				<span>Default variant</span>
			</ClickableCard>
			<ClickableCard variant="outline">
				<span>Outline variant</span>
			</ClickableCard>
			<ClickableCard variant="ghost">
				<span>Ghost variant</span>
			</ClickableCard>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<ClickableCard disabled className="wwc:w-64">
			<div>
				<h3 className="wwc:font-semibold">Disabled</h3>
				<p className="wwc:text-sm wwc:text-muted-foreground">Cannot be clicked</p>
			</div>
		</ClickableCard>
	),
};
