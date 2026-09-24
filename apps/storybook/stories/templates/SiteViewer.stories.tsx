import type {Meta, StoryObj} from "storybook/internal/types";

import {TooltipProvider} from "@corensystem/coren-ui/tooltip";

// Renders the standalone Site Viewer (prototypes/capture) — the site-level model with the villa
// colour-selection options and a click-into-a-villa → full house-level 3D transition.
import {SiteView} from "../../../../prototypes/capture/src/site-view";

// Site Viewer — the ThatOpen site-level model (villas) over the DroneDeploy ortho: per-villa hover,
// the construction-progress colour options (normal / progress tint, bundled offline), and a
// click-into-a-villa transition that dissolves the map into the full house-level BIM view
// (FragmentViewer + floor list + inspectors), with a "Back to Site" header to return. Live WebGL —
// the model mounts on load, so snapshots are disabled for this template.
const meta = {
	title: "Templates/Building Viewer/Site Viewer/3D Site Viewer",
	component: SiteView,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		// Live WebGL + a 3D model iframe — not deterministic, so don't snapshot it.
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component:
					"The site-level 3D command surface: the villas' ThatOpen site model over a satellite ortho, with " +
					"per-villa hover and colour-selection options (Normal / Progress) that tint each villa by its " +
					"construction progress. Clicking a villa zooms + dissolves the map into the full house-level BIM " +
					"view (the Building Viewer experience), with a Back to Site header to return. Based on the Capture " +
					"app's Site workspace.",
			},
		},
	},
} satisfies Meta<typeof SiteView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The live Site Viewer: site model + colour options + click-into-villa. */
export const Default: Story = {
	render: () => (
		<TooltipProvider>
			<div className="wwc:h-screen wwc:w-full">
				<SiteView />
			</div>
		</TooltipProvider>
	),
};
