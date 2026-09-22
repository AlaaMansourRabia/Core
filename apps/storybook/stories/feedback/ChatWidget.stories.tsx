import type {Meta, StoryObj} from "storybook/internal/types";

import {ChatWidget} from "@core/core-ui/chat/core-chat-widget";

const meta = {
	title: "Widgets/Chat/Chat Widget",
	component: ChatWidget,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: "Embedded chat widget for user support and feedback. Stories pending manual implementation.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:justify-center wwc:h-64 wwc:border wwc:border-dashed wwc:rounded-lg wwc:text-muted-foreground">
			Chat Widget stories coming soon
		</div>
	),
};
