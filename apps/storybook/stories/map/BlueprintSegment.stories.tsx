import type {Meta, StoryObj} from "storybook/internal/types";

import {BlueprintSegment} from "@corensystem/core-ui/blueprint-segment";

function FloorPlan() {
	return (
		<svg
			viewBox="0 0 1000 680"
			preserveAspectRatio="xMidYMid meet"
			className="wwc:h-full wwc:w-full"
			role="img"
			aria-label="Floor plan"
		>
			<rect x="0" y="0" width="1000" height="680" fill="#ffffff" />
			<rect x="60" y="60" width="880" height="560" fill="none" stroke="#3f3f46" strokeWidth="4" />
			<g fill="none" stroke="#52525b" strokeWidth="2">
				<rect x="60" y="320" width="880" height="60" />
				<rect x="240" y="60" width="220" height="260" />
				<rect x="460" y="60" width="300" height="130" />
				<rect x="760" y="380" width="180" height="240" />
			</g>
		</svg>
	);
}

const meta = {
	title: "Widgets/Map/Blueprint Segment",
	component: BlueprintSegment,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"One cell of a multi-floor blueprint split: a framed blueprint (or a “No blueprint” placeholder when `plan` is omitted), a floor label + % chip top-left, and an optional walk-through button bottom-right (`onWalkthrough`). Tile several to build a split canvas; pair the walk-through button with a `WalkthroughModal`.",
			},
		},
	},
} satisfies Meta<typeof BlueprintSegment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:grid wwc:w-[720px] wwc:grid-cols-2 wwc:gap-4">
			<BlueprintSegment className="wwc:h-56" label="GF" value={100} plan={<FloorPlan />} onWalkthrough={() => {}} />
			<BlueprintSegment className="wwc:h-56" label="L7" value={68} />
		</div>
	),
};
