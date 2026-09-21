import type * as React from "react";
import type {Meta, StoryObj} from "storybook/internal/types";

import {ProgressListItem, type ProgressMetric} from "@wakecap/core-ui/progress-list-item";

const evMetrics: ProgressMetric[] = [
	{label: "BAC", value: "181.6K"},
	{label: "EV", value: "165.8K"},
	{label: "PV", value: "181.6K"},
	{label: "SV", value: "-15.8K", tone: "negative"},
	{label: "Sch", value: "100%"},
];

const rollupMetrics: ProgressMetric[] = [
	{label: "BAC", value: "525.1M"},
	{label: "EV", value: "158.9M"},
	{label: "PV", value: "148.4M"},
	{label: "SV", value: "10.5M", tone: "positive"},
];

const objectMetrics: ProgressMetric[] = [
	{label: "BAC", value: "181.6K"},
	{label: "EV", value: "165.8K"},
];

function ListContainer({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:max-w-3xl wwc:divide-y wwc:divide-border wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background">
			{children}
		</div>
	);
}

const meta = {
	title: "Widgets/Progress/Progress List Item",
	component: ProgressListItem,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"The shared row for a progress-details list. One component covers every WBS level via the `variant` prop — a `generic` grouping (zone / category / division), a `task` (the level with a schedule badge + progress bar), and an `object` under a task. Every variant stacks the name over its code. Rows with an `onOpen` handler render as buttons that drill into the next level (an object opens its Operations Drawer).",
			},
		},
	},
} satisfies Meta<typeof ProgressListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Generic: Story = {
	render: () => (
		<ListContainer>
			<ProgressListItem
				variant="generic"
				title="Zone 1 - Block A"
				subtitle="MRM-RS-11-BL-2"
				metrics={rollupMetrics}
				tools={2111}
				onOpen={() => {}}
			/>
			<ProgressListItem
				variant="generic"
				title="Structural"
				subtitle="MRM-RS-20-BL-2"
				metrics={rollupMetrics}
				tools={10310}
				onOpen={() => {}}
			/>
		</ListContainer>
	),
};

export const Task: Story = {
	render: () => (
		<ListContainer>
			<ProgressListItem
				variant="task"
				title="Earth work - Backfilling For Foundation"
				subtitle="RM-C-1A-B01-01-T-111"
				badge={{label: "+21.3% Schedule ahead", tone: "deviation"}}
				metrics={evMetrics}
				progress={79}
				tools={4}
				onOpen={() => {}}
			/>
			<ProgressListItem
				variant="task"
				title="Earth work - Excavation For PC"
				subtitle="RM-C-1A-B01-01-T-122"
				badge={{label: "Within 5%", tone: "within"}}
				metrics={evMetrics.map((m) => (m.label === "SV" ? {...m, value: "-176.9"} : m))}
				progress={95}
				tools={4}
				onOpen={() => {}}
			/>
		</ListContainer>
	),
};

export const Object: Story = {
	render: () => (
		<ListContainer>
			<ProgressListItem
				variant="object"
				title="Precast Panel 1"
				subtitle="RM-C-1A-B01-01-T-111-O1"
				metrics={objectMetrics}
				progress={77}
				tools={2}
				onOpen={() => {}}
			/>
			<ProgressListItem
				variant="object"
				title="Foundation Block 2"
				subtitle="RM-C-1A-B01-01-T-111-O2"
				metrics={[
					{label: "BAC", value: "92.4K"},
					{label: "EV", value: "70.1K"},
				]}
				progress={69}
				tools={3}
				onOpen={() => {}}
			/>
		</ListContainer>
	),
};

export const AllLevels: Story = {
	render: () => (
		<ListContainer>
			<ProgressListItem
				variant="generic"
				title="Zone 1 - Block A"
				subtitle="MRM-RS-11-BL-2"
				metrics={rollupMetrics}
				tools={2111}
				onOpen={() => {}}
			/>
			<ProgressListItem
				variant="task"
				title="Earth work - Backfilling For Foundation"
				subtitle="RM-C-1A-B01-01-T-111"
				badge={{label: "+21.3% Schedule ahead", tone: "deviation"}}
				metrics={evMetrics}
				progress={79}
				tools={4}
				onOpen={() => {}}
			/>
			<ProgressListItem
				variant="object"
				title="Precast Panel 1"
				subtitle="RM-C-1A-B01-01-T-111-O1"
				metrics={objectMetrics}
				progress={77}
				tools={2}
				onOpen={() => {}}
			/>
		</ListContainer>
	),
};
