import type {Meta, StoryObj} from "storybook/internal/types";

import {Legend, type LegendItem, type LegendTab, TabbedLegend} from "@core/core-ui/legend";
import {useState} from "react";

const MILESTONES: LegendItem[] = [
	{id: "ms35", label: "M35", description: "Villa milestone", color: "#7C3AED"},
	{id: "ms50", label: "M50", description: "Villa milestone", color: "#2563EB"},
	{id: "ms65", label: "M65", description: "Villa milestone", color: "#38BDF8"},
	{id: "ms80", label: "M80", description: "Villa milestone", color: "#5EEAD4"},
	{id: "ms95", label: "M95", description: "Villa milestone", color: "#01B04A"},
	{id: "ms100", label: "M100", description: "Villa milestone", color: "#73F547"},
	{id: "missing", label: "Missing data", description: "No milestone data", color: "#94a3b8", opacity: 0.5},
];

const CHANGES: LegendItem[] = [
	{id: "added", label: "Added", color: "#16a34a"},
	{id: "changed", label: "Changed", color: "#f59e0b"},
	{id: "removed", label: "Removed", color: "#e11d48"},
];

const PROGRESS: LegendItem[] = [
	{id: "done", label: "Complete", description: "100% cast", color: "#01B04A"},
	{id: "wip", label: "In progress", description: "Active pour", color: "#2563EB"},
	{id: "planned", label: "Planned", description: "Not started", color: "#94a3b8"},
	{id: "delayed", label: "Delayed", description: "Behind plan", color: "#e11d48"},
];

const TRADES: LegendItem[] = [
	{id: "civil", label: "Civil", color: "#7C3AED"},
	{id: "mep", label: "MEP", color: "#f59e0b"},
	{id: "finishing", label: "Finishing", color: "#38BDF8"},
	{id: "structure", label: "Structure", color: "#01B04A"},
];

// Each tab keys a different overlay for the current selection.
const VIEW_TABS: LegendTab[] = [
	{id: "progress", label: "Progress", items: PROGRESS, footnote: "Cast status per villa polygon."},
	{id: "milestones", label: "Milestones", items: MILESTONES},
	{id: "trades", label: "Trades", items: TRADES},
];

// A faint blueprint-grid backdrop for the floating example.
function Canvas({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:relative wwc:h-72 wwc:w-full wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-blue-50 dark:wwc:bg-blue-950/40">
			<svg className="wwc:h-full wwc:w-full" aria-hidden="true">
				<defs>
					<pattern id="legend-story-grid" width="24" height="24" patternUnits="userSpaceOnUse">
						<path
							d="M 24 0 L 0 0 0 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="wwc:text-blue-300/50"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#legend-story-grid)" />
			</svg>
			{children}
		</div>
	);
}

const meta = {
	title: "Components/Data Display/Legend",
	component: Legend,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'A compact key that maps swatch colors to labels. Floats over a canvas/map (bottom-right by default) or embeds inline (`placement="static"`), and can minimize to a small button. Swatch colors are arbitrary CSS values, so status ramps aren\'t limited to tokens.',
			},
		},
	},
} satisfies Meta<typeof Legend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FloatingOverCanvas: Story = {
	render: () => {
		function Demo() {
			const [collapsed, setCollapsed] = useState(false);
			return (
				<Canvas>
					<Legend
						title="Villa milestones"
						items={MILESTONES}
						columns={2}
						collapsed={collapsed}
						onCollapsedChange={setCollapsed}
						footnote="Milestone months appear only on villa/plot polygons with milestone data."
					/>
				</Canvas>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Placed bottom-right over a canvas with a `footnote`. Click the minus to minimize it to a chip, then the chip to reopen.",
			},
		},
	},
};

export const Tabbed: StoryObj<typeof TabbedLegend> = {
	render: () => {
		function Demo() {
			const [collapsed, setCollapsed] = useState(false);
			return (
				<Canvas>
					<TabbedLegend
						title="View mode"
						tabs={VIEW_TABS}
						defaultValue="milestones"
						collapsed={collapsed}
						onCollapsedChange={setCollapsed}
					/>
				</Canvas>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					'A collapsible header ("view mode") sits above Core `Tabs`; each tab swaps in its own colors and rows. Content caps at `maxRows` (default 4) and overflows into extra columns, so it grows sideways instead of getting tall — the `Milestones` tab (7 items) splits into two columns. Click the minus to minimize it to a chip.',
			},
		},
	},
};

export const InlineAndCircle: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:gap-6">
			<Legend title="What changed" shape="circle" placement="static" collapsible={false} items={CHANGES} />
			<Legend
				title="Milestones"
				placement="static"
				collapsible={false}
				columns={1}
				items={MILESTONES.slice(0, 4)}
				status="Loading…"
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'`placement="static"` embeds it inline; `shape="circle"` rounds the swatches. Set `collapsible={false}` to always show it.',
			},
		},
	},
};
