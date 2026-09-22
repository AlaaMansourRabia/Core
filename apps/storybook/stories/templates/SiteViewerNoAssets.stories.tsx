import type {Meta, StoryObj} from "storybook/internal/types";

import {TooltipProvider} from "@corensystem/core-ui/tooltip";

// Renders the Site Viewer (prototypes/capture) in its "No Assets" representation: instead of the detailed
// walls/slabs site model, each villa is drawn as a single massing block over the satellite ortho. Same
// hover card, progress colours, TV mode and click-into-a-villa transition as the 3D Site Viewer.
import {SiteView} from "../../../../prototypes/capture/src/site-view";

// No Assets View — Has Drone Image: the block representation of the site that still sits over the drone
// aerial. Each villa is a massing block (its bounding volume) over the DroneDeploy ortho — the same site
// surface as the 3D Site Viewer, minus the detailed BIM assets. Per-villa hover, Normal / Progress
// colour options, TV mode and the zoom-and-dissolve drill into the full house-level BIM view all carry
// over. Live WebGL — the model mounts on load (blocks are derived from it), so snapshots are disabled.
// Sibling: "No Assets" (the same villas as flat block tiles on a plain board, no image, no 3D).
const meta = {
	title: "Templates/Building Viewer/Site Viewer/No Assets View/Has Drone Image",
	component: SiteView,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		// Live WebGL + a 3D model iframe — not deterministic, so don't snapshot it.
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component:
					"The site-level command surface without the detailed BIM assets: each villa is drawn as a " +
					"single massing block over the satellite ortho, derived from the site model's per-villa " +
					"footprints. Keeps per-villa hover, the Normal / Progress colour options (each block tinted by " +
					"its construction progress), TV mode, and the click-into-a-villa transition that dissolves the " +
					"map into the full house-level BIM view. A lighter-weight read of the whole site when the " +
					"detailed geometry isn't needed.",
			},
		},
	},
} satisfies Meta<typeof SiteView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Site Viewer with villas drawn as massing blocks instead of the detailed assets. */
export const Default: Story = {
	render: () => (
		<TooltipProvider>
			<div className="wwc:h-screen wwc:w-full">
				<SiteView representation="blocks" />
			</div>
		</TooltipProvider>
	),
};
