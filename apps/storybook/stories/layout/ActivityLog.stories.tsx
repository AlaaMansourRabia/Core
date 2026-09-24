import type {Meta, StoryObj} from "storybook/internal/types";

import {ActivityActor, ActivityItem, ActivityLog, ActivityRef} from "@corensystem/coren-ui/activity-log";
import {Link2, MessageSquare, Paperclip, Reply, Trash2} from "lucide-react";

const meta = {
	title: "Widgets/Activity/Activity Log",
	component: ActivityLog,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Vertical chronological feed of activity / history entries. A continuous connector line passes through each item's icon badge. Composable — each item picks its own icon, message, and relative timestamp.",
			},
		},
	},
} satisfies Meta<typeof ActivityLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-2xl wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-6">
			<ActivityLog>
				<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="less than a minute ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
				</ActivityItem>
				<ActivityItem icon={<Paperclip className="wwc:h-4 wwc:w-4" />} timestamp="about 12 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> removed an attachment.
				</ActivityItem>
				<ActivityItem icon={<Link2 className="wwc:h-4 wwc:w-4" />} timestamp="about 12 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> removed this <ActivityRef>link</ActivityRef>.
				</ActivityItem>
				<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
				</ActivityItem>
				<ActivityItem icon={<Paperclip className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> uploaded a new attachment.
				</ActivityItem>
				<ActivityItem icon={<Link2 className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> added <ActivityRef>link</ActivityRef>.
				</ActivityItem>
				<ActivityItem icon={<Reply className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> marked that this work item relates to{" "}
					<ActivityRef>ASMOB-6</ActivityRef>.
				</ActivityItem>
				<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
				</ActivityItem>
				<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
					<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
				</ActivityItem>
			</ActivityLog>
		</div>
	),
};

export const SingleItem: Story = {
	render: () => (
		<div className="wwc:max-w-2xl wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-6">
			<ActivityLog>
				<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="just now">
					<ActivityActor>alaa@core.com</ActivityActor> created this work item.
				</ActivityItem>
			</ActivityLog>
		</div>
	),
};

export const MixedActors: Story = {
	render: () => (
		<div className="wwc:max-w-2xl wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-6">
			<ActivityLog>
				<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="2 minutes ago">
					<ActivityActor>Layla N.</ActivityActor> commented.
				</ActivityItem>
				<ActivityItem icon={<Paperclip className="wwc:h-4 wwc:w-4" />} timestamp="1 hour ago">
					<ActivityActor>Ahmed R.</ActivityActor> uploaded <ActivityRef>safety-report.pdf</ActivityRef>.
				</ActivityItem>
				<ActivityItem icon={<Reply className="wwc:h-4 wwc:w-4" />} timestamp="3 hours ago">
					<ActivityActor>Maya K.</ActivityActor> linked this to <ActivityRef>WC-1042</ActivityRef>.
				</ActivityItem>
				<ActivityItem icon={<Trash2 className="wwc:h-4 wwc:w-4" />} timestamp="yesterday">
					<ActivityActor>Ahmed R.</ActivityActor> removed the previous attachment.
				</ActivityItem>
			</ActivityLog>
		</div>
	),
};
