import type {Meta, StoryObj} from "storybook/internal/types";

import {FloorProgressBar} from "@wakecap/core-ui/floor-progress-bar";

const meta = {
	title: "Components/Primitives/FloorProgressBar",
	component: FloorProgressBar,
	tags: ["autodocs"],
	argTypes: {
		value: {control: {type: "range", min: 0, max: 100, step: 1}},
		tone: {control: "select", options: ["neutral", "primary"]},
		showTrack: {control: "boolean"},
	},
	args: {
		value: 64,
		tone: "neutral",
		showTrack: true,
	},
	parameters: {
		docs: {
			description: {
				component:
					"A thin determinate progress bar with a marker tick. It positions itself absolutely along the bottom edge of its nearest positioned ancestor — overlay it on a floor tile / thumbnail.",
			},
		},
	},
} satisfies Meta<typeof FloorProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// The control-driven stories need a positioned box so the bottom-anchored bar has something to sit on.
export const Default: Story = {
	render: (args) => (
		<div className="wwc:relative wwc:h-16 wwc:w-64 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card">
			<FloorProgressBar {...args} />
		</div>
	),
};

export const Primary: Story = {...Default, args: {tone: "primary"}};

export const NoTrack: Story = {...Default, args: {showTrack: false}};

export const AllVariants: Story = {
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			{([25, 60, 90] as const).map((value) => (
				<div
					key={value}
					className="wwc:relative wwc:h-12 wwc:w-64 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card"
				>
					<FloorProgressBar value={value} tone={value > 80 ? "primary" : "neutral"} />
				</div>
			))}
		</div>
	),
};

const FLOOR_TILES = [
	{name: "Level 3 — Mechanical", workers: 24, progress: 82},
	{name: "Level 2 — Fit-out", workers: 18, progress: 46},
	{name: "Level 1 — Lobby", workers: 6, progress: 100},
] as const;

export const OnFloorTiles: Story = {
	parameters: {
		controls: {disable: true},
		docs: {
			description: {
				story:
					"In context: each floor tile is a `relative` card with its own content (title, worker count, and the completion `%` pinned to the top-right corner). `FloorProgressBar` sits on the tile's bottom edge — neutral while in-progress, primary once complete.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:w-64 wwc:flex-col wwc:gap-1">
			{FLOOR_TILES.map((floor) => (
				<div
					key={floor.name}
					className="wwc:relative wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-3 wwc:pb-2.5 wwc:pt-2"
				>
					<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2">
						<div className="wwc:flex wwc:min-w-0 wwc:flex-col">
							<span className="wwc:truncate wwc:text-sm wwc:font-semibold wwc:leading-tight">{floor.name}</span>
							<span className="wwc:text-xs wwc:text-muted-foreground">{floor.workers} on site</span>
						</div>
						<span className="wwc:shrink-0 wwc:rounded wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:font-semibold wwc:tabular-nums">
							{floor.progress}%
						</span>
					</div>
					<FloorProgressBar value={floor.progress} tone={floor.progress >= 100 ? "primary" : "neutral"} />
				</div>
			))}
		</div>
	),
};
