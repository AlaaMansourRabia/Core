import type {Meta, StoryObj} from "storybook/internal/types";

import {Banner} from "@core/core-ui/banner";

const meta = {
	title: "Components/Feedback/Banner",
	component: Banner,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Contextual alert banner for system insights, warnings, and action prompts. Supports four variants (info, warning, danger, success) with optional description, items list, action button, and dismiss.",
			},
		},
	},
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-3">
			<Banner
				variant="info"
				title="Version 2.0 is now available!"
				description="Read the full release notes to learn about new features."
				onDismiss={() => {}}
			/>
			<Banner
				variant="warning"
				title="8 complaints are due within 4 hours"
				description="Immediate action required to avoid SLA breach."
				onDismiss={() => {}}
			/>
			<Banner
				variant="danger"
				title="No complaints are being processed"
				description="14 complaints are still NEW and none are in progress."
				onDismiss={() => {}}
			/>
			<Banner
				variant="success"
				title="All SLAs met this week"
				description="Great job! Resolution rate improved by 15%."
				onDismiss={() => {}}
			/>
		</div>
	),
};

export const SmartInsights: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-3">
			<Banner
				variant="danger"
				title="No complaints are being processed"
				description="14 complaints are still NEW and none are in progress."
				action={{label: "Assign Now", onClick: () => {}}}
				onDismiss={() => {}}
			/>
			<Banner
				variant="danger"
				title="5 complaints have breached SLA"
				description="Immediate action required to avoid escalation."
				action={{label: "View Overdue", onClick: () => {}}}
				onDismiss={() => {}}
			/>
			<Banner
				variant="warning"
				title="8 complaints are due within 4 hours"
				description="Prioritize these complaints to meet SLA targets."
				action={{label: "View At Risk", onClick: () => {}}}
				onDismiss={() => {}}
			/>
			<Banner
				variant="warning"
				title="Complaints are not being picked up quickly"
				description="Avg. response time: 18 hours (target: 4 hours)."
				onDismiss={() => {}}
			/>
			<Banner
				variant="warning"
				title="High number of reopened complaints"
				description="6 complaints were reopened this week. Investigate root causes."
				action={{label: "View Reopened", onClick: () => {}}}
				onDismiss={() => {}}
			/>
			<Banner
				variant="danger"
				title="No one owns 9 complaints"
				description="Assign responsible teams immediately."
				action={{label: "Assign Teams", onClick: () => {}}}
				onDismiss={() => {}}
			/>
		</div>
	),
};

export const CombinedSmartInsight: Story = {
	render: () => (
		<Banner
			variant="danger"
			title="System is at risk"
			items={["14 complaints are still NEW", "5 have breached SLA", "0 have been resolved"]}
			action={{label: "Take Action", onClick: () => {}}}
			onDismiss={() => {}}
		/>
	),
};

export const WithActionButton: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-3">
			<Banner
				variant="danger"
				title="No one owns 9 complaints"
				description="Assign responsible teams immediately."
				action={{label: "Assign Teams", onClick: () => {}}}
				onDismiss={() => {}}
			/>
			<Banner
				variant="warning"
				title="Complaints are not being picked up quickly"
				description="Avg. response time: 18 hours (target: 4 hours)."
				action={{label: "Review Queue", onClick: () => {}}}
				onDismiss={() => {}}
			/>
			<Banner
				variant="info"
				title="New reporting features available"
				description="Export complaints data to CSV and PDF."
				action={{label: "Learn More", onClick: () => {}}}
				onDismiss={() => {}}
			/>
		</div>
	),
};
