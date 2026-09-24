import type {Meta, StoryObj} from "storybook/internal/types";

import {MapTransitionSurface, useMapTransition} from "@corensystem/coren-ui/map-transition";
import {useState} from "react";

// The capture canvas "reload" transition (zoom-out → blur → spinner → zoom-back-in) as a standalone,
// reusable pair: the useMapTransition() machine + the <MapTransitionSurface> presentational wrapper.
// This demo swaps a coloured panel through the transition on click — the same feel used when the capture
// map changes location/mode.
const PANELS = [
	{label: "Zone 1 — A", bg: "wwc:bg-sky-500"},
	{label: "Zone 1 — B", bg: "wwc:bg-emerald-500"},
	{label: "Zone 2", bg: "wwc:bg-amber-500"},
	{label: "Phase 1", bg: "wwc:bg-violet-500"},
];

const meta = {
	title: "Motion/Map Transition",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Reusable canvas 'reload' transition extracted from the Capture UI Enhanced template. `useMapTransition()` is the state machine (`run(apply)` + `scaledOut/blurred/showSpinner` flags); `<MapTransitionSurface>` is the presentational scale-out + blur + spinner wrapper. Click a location to swap the panel through the transition. The scale/blur is applied to an inner layer only, so chrome rendered as a sibling (the buttons here) is never pulled by the transform.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
	const [index, setIndex] = useState(0);
	const tx = useMapTransition();
	const panel = PANELS[index];

	return (
		<div className="wwc:flex wwc:h-screen wwc:w-full wwc:flex-col wwc:gap-3 wwc:bg-muted wwc:p-4">
			{/* Chrome — sibling of the surface, so the scale/blur never pulls it */}
			<div className="wwc:flex wwc:shrink-0 wwc:gap-2">
				{PANELS.map((p, i) => (
					<button
						key={p.label}
						onClick={() => tx.run(() => setIndex(i))}
						disabled={tx.phase !== "idle"}
						className={
							"wwc:rounded-md wwc:px-3 wwc:py-1.5 wwc:text-sm wwc:transition-colors " +
							(i === index
								? "wwc:bg-primary wwc:text-primary-foreground"
								: "wwc:bg-background wwc:text-foreground wwc:hover:bg-accent")
						}
					>
						{p.label}
					</button>
				))}
				<span className="wwc:ml-auto wwc:self-center wwc:text-xs wwc:text-muted-foreground">phase: {tx.phase}</span>
			</div>

			{/* The swappable content, wrapped in the transition surface */}
			<div className="wwc:relative wwc:min-h-0 wwc:flex-1 wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border">
				<MapTransitionSurface scaledOut={tx.scaledOut} blurred={tx.blurred} showSpinner={tx.showSpinner}>
					<div className={`wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center ${panel.bg}`}>
						<span className="wwc:text-3xl wwc:font-semibold wwc:text-white">{panel.label}</span>
					</div>
				</MapTransitionSurface>
			</div>
		</div>
	);
}

export const Default: Story = {
	render: () => <Demo />,
};
