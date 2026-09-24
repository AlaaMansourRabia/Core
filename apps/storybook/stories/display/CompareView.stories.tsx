import type {Meta, StoryObj} from "storybook/internal/types";

import {CompareView} from "@corensystem/coren-ui/compare-view";

// Two geo-aligned "captures" of the same scene; the "after" gains a structure and a warmer tone.
function Scene({variant}: {variant: "before" | "after"}) {
	const after = variant === "after";
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div
				className={
					after
						? "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-amber-100 wwc:via-orange-100 wwc:to-rose-200"
						: "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-slate-200"
				}
			/>
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-500/40" aria-hidden="true">
				<path d="M0 200 Q 220 150 440 210 T 900 190" fill="none" stroke="currentColor" strokeWidth="7" />
				<path d="M150 0 L 210 320" fill="none" stroke="currentColor" strokeWidth="5" />
				{after && <rect x="260" y="100" width="140" height="100" rx="6" fill="currentColor" opacity="0.5" />}
			</svg>
		</div>
	);
}

const meta = {
	title: "Components/Data Display/Compare View",
	component: CompareView,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Compares two geo-aligned sources. `swipe` (default) overlays them with a draggable reveal divider — drag the handle or focus it and use ←/→; `side-by-side` splits the box into two panes. Pass any nodes (images, maps, canvases) for `before`/`after`.",
			},
		},
	},
	args: {interactive: true, defaultScale: 1.5},
	render: (args) => (
		<div className="wwc:h-80 wwc:w-[36rem] wwc:overflow-hidden wwc:rounded-lg wwc:border">
			<CompareView {...args} before={<Scene variant="before" />} after={<Scene variant="after" />} />
		</div>
	),
} satisfies Meta<typeof CompareView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Swipe: Story = {
	args: {mode: "swipe", beforeLabel: "As-planned", afterLabel: "As-built"},
	parameters: {
		docs: {description: {story: "Drag the center handle to reveal more of one source. Focus it and use ←/→ to nudge."}},
	},
};

export const SideBySide: Story = {
	args: {mode: "side-by-side", beforeLabel: "As-planned", afterLabel: "As-built"},
	parameters: {
		docs: {
			description: {
				story:
					"Both sources in full, split into two panes. Drag to pan and scroll to zoom; the lock on the divider syncs both panes (unlock to move them independently).",
			},
		},
	},
};
