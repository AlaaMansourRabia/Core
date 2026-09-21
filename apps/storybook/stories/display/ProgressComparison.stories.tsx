import type {Meta, StoryObj} from "storybook/internal/types";

import {
	ProgressComparison,
	type ProgressComparisonMilestone,
	type ProgressComparisonStat,
} from "@wakecap/core-ui/progress-comparison";

const STATS: ProgressComparisonStat[] = [
	{label: "PV", value: "$160,604"},
	{label: "BAC", value: "$817,218"},
	{label: "SV", value: "-$27,821", negative: true},
	{label: "EV", value: "$184,262"},
];

const MILESTONES: ProgressComparisonMilestone[] = [
	{date: "Jan-27", label: "M35", complete: true},
	{date: "Jan-27", label: "M50", complete: true},
	{date: "Jan-27", label: "M65", complete: true},
	{date: "Mar-27", label: "M80", marker: 80},
	{date: "Jul-27", label: "M95", marker: 95},
	{date: "Dec-27", label: "M100", flag: true},
];

// Schematic floor-plan preview, standing in for a real drawing/thumbnail.
function FloorPlan() {
	return (
		<svg viewBox="0 0 340 160" className="wwc:h-full wwc:w-full" role="img" aria-label="Floor plan preview">
			<rect x="0" y="0" width="340" height="160" fill="#ffffff" />
			<g fill="none" stroke="#3f3f46" strokeWidth="2">
				<rect x="20" y="20" width="300" height="120" />
				<rect x="20" y="20" width="70" height="55" />
				<rect x="20" y="75" width="70" height="65" />
				<rect x="90" y="20" width="90" height="120" />
				<rect x="180" y="20" width="140" height="70" />
				<rect x="180" y="90" width="140" height="50" />
				<line x1="130" y1="90" x2="130" y2="140" />
			</g>
			<g fill="none" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3 3">
				<line x1="10" y1="10" x2="330" y2="10" />
				<line x1="10" y1="10" x2="10" y2="150" />
			</g>
		</svg>
	);
}

const meta = {
	title: "Components/Data Display/Progress Comparison",
	component: ProgressComparison,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Compares two progress sources (most commonly actual vs. planned): two hero percentages with a variance pill and a combined bar, plus an expandable stats grid. The `milestone` variant adds a stepper timeline; the `progress` variant shows a status chip. Designed to sit inside a modal.",
			},
		},
	},
	argTypes: {
		variant: {control: "inline-radio", options: ["progress", "milestone", "preview"]},
	},
	args: {
		title: "Ground Floor",
		subtitle: "Floor | HOUSE-12-F0",
		primary: {label: "Approved", value: 67},
		secondary: {label: "Planned", value: 71},
		stats: STATS,
		collapsible: true,
	},
	render: (args) => (
		<div className="wwc:w-[380px] wwc:max-w-full">
			<ProgressComparison {...args} />
		</div>
	),
} satisfies Meta<typeof ProgressComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Progress: Story = {
	args: {
		variant: "progress",
		status: {label: "In Progress", color: "#1c60b7"},
	},
};

export const Collapsed: Story = {
	args: {
		variant: "progress",
		status: {label: "Milestone 65", color: "#38bdf8"},
		collapsible: true,
		defaultCollapsed: true,
	},
};

// Collapsed with a milestone badge — expanding reveals the stepper.
export const CollapsedSummary: Story = {
	args: {
		variant: "milestone",
		status: {label: "Milestone 65", color: "#38bdf8"},
		milestones: MILESTONES,
		collapsible: true,
		collapsedSummary: true,
		defaultCollapsed: true,
	},
};

// Collapsed with a plain status badge — expanding reveals the status view (no stepper).
export const CollapsedStatusSummary: Story = {
	args: {
		variant: "progress",
		status: {label: "In Progress", color: "#1c60b7"},
		collapsible: true,
		collapsedSummary: true,
		defaultCollapsed: true,
	},
};

export const Milestone: Story = {
	args: {
		variant: "milestone",
		status: {label: "M65", color: "#38bdf8"},
		milestones: MILESTONES,
	},
};

export const ExpandableStats: Story = {
	args: {
		variant: "progress",
		status: {label: "In Progress", color: "#1c60b7"},
		primary: {label: "Actual", value: 82},
		secondary: {label: "Baseline", value: 75},
		stats: [...STATS, {label: "CPI", value: "0.94", negative: true}, {label: "SPI", value: "1.02"}],
	},
};

export const PositiveVariance: Story = {
	args: {
		variant: "progress",
		status: {label: "Ahead", color: "#16a34a"},
		primary: {label: "Actual", value: 78},
		secondary: {label: "Planned", value: 71},
	},
};

export const Preview: Story = {
	args: {
		variant: "preview",
		image: <FloorPlan />,
		action: {label: "View Walkthrough"},
	},
};
