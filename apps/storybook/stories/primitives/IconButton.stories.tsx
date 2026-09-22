import type {Meta, StoryObj} from "storybook/internal/types";

import {IconButton} from "@core/core-ui/icon-button";
import {Heart, Search, Settings, Star, Trash} from "lucide-react";

const meta = {
	title: "Components/Primitives/IconButton",
	component: IconButton,
	tags: ["autodocs"],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<IconButton tooltip="Search">
			<Search />
		</IconButton>
	),
};

export const Variants: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<IconButton variant="default" tooltip="Default">
				<Star />
			</IconButton>
			<IconButton variant="destructive" tooltip="Destructive">
				<Trash />
			</IconButton>
			<IconButton variant="outline" tooltip="Outline">
				<Settings />
			</IconButton>
			<IconButton variant="secondary" tooltip="Secondary">
				<Heart />
			</IconButton>
			<IconButton variant="ghost" tooltip="Ghost">
				<Search />
			</IconButton>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<IconButton size="sm" tooltip="Small">
				<Search />
			</IconButton>
			<IconButton size="md" tooltip="Medium">
				<Search />
			</IconButton>
			<IconButton size="lg" tooltip="Large">
				<Search />
			</IconButton>
		</div>
	),
};

export const Loading: Story = {
	render: () => (
		<IconButton tooltip="Loading" loading>
			<Search />
		</IconButton>
	),
};

export const Disabled: Story = {
	render: () => (
		<IconButton tooltip="Disabled" disabled>
			<Search />
		</IconButton>
	),
};
