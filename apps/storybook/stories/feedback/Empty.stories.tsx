import type {ComponentType} from "react";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Empty, EmptySelection} from "@corensystem/coren-ui/empty";

const meta = {
	title: "Components/Feedback/Empty",
	component: Empty,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Empty state component for when there is no data to display. Supports icon, title, description, and action slots.",
			},
		},
	},
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: "No results found",
		description: "Try adjusting your search or filter to find what you are looking for.",
	},
};

export const WithIcon: Story = {
	args: {
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="40"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
		),
		title: "No results found",
		description: "We could not find any items matching your search criteria.",
	},
};

export const WithAction: Story = {
	args: {
		title: "No projects yet",
		description: "Get started by creating your first project.",
		action: <Button>Create Project</Button>,
	},
};

export const FullExample: Story = {
	args: {
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="40"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
				<path d="M14 2v4a2 2 0 0 0 2 2h4" />
			</svg>
		),
		title: "No documents",
		description: "You have not uploaded any documents yet. Upload a document to get started.",
		action: <Button>Upload Document</Button>,
	},
};

export const TitleOnly: Story = {
	args: {
		title: "Nothing here",
	},
};

/* ── EmptySelection — the nothing-selected variant ─────────────────────────── */

const selectionDecorator = [
	(Story: ComponentType) => (
		<div className="wwc:h-[420px] wwc:w-full wwc:bg-background">
			<Story />
		</div>
	),
];

/** Nothing-selected state for a viewer pane, with the default list+viewer bindings.
 *  Use this instead of Empty when the data exists but nothing is picked yet. */
export const Selection: StoryObj<typeof EmptySelection> = {
	render: (args) => <EmptySelection {...args} />,
	args: {itemNoun: "observation"},
	decorators: selectionDecorator,
};

/** Custom bindings for a surface with a different shortcut set. */
export const SelectionCustomShortcuts: StoryObj<typeof EmptySelection> = {
	render: (args) => <EmptySelection {...args} />,
	args: {
		itemNoun: "message",
		shortcuts: [
			{keys: ["J"], label: "Next message"},
			{keys: ["K"], label: "Previous message"},
			{keys: ["⌘", "K"], label: "Command palette"},
		],
	},
	decorators: selectionDecorator,
};

/** No legend — pass an empty array when the surface has no shortcuts to advertise. */
export const SelectionWithoutShortcuts: StoryObj<typeof EmptySelection> = {
	render: (args) => <EmptySelection {...args} />,
	args: {
		itemNoun: "record",
		shortcuts: [],
		description: "Pick a record on the left to see its details here.",
	},
	decorators: selectionDecorator,
};
