import type {Meta, StoryObj} from "storybook/internal/types";

import {TooltipProvider} from "@wakecap/core-ui/tooltip";

// The Capture UI variation now renders the real villa-level experience from the Site Viewer — the same
// house-level BIM view you drill into from the site map, minus the map. SingleHouseView composes the
// prototype's real left Floor panel (Floor / Schedule / LBS tabs, the actual villa schedule) + right
// inspectors (Project / Floor / Object) around the FragmentViewer + ViewerToolbar, all wired to the
// storey ghosting + 4D timeline. Pulled from prototypes/capture, the same source SiteViewer renders.
import {SingleHouseView} from "../../../../prototypes/capture/src/house-view";

// Capture UI — the villa-level BIM view: the ThatOpen villa model (FragmentViewer + ViewerToolbar)
// framed by the Capture app's real floor panel (left) and inspectors (right), driving storey isolation
// + ghosting and the 4D construction timeline. This is <SingleHouseView/> — SiteViewer's house-level
// view mounted standalone (no site map). Live WebGL: the model mounts on load, so snapshots are off.
const meta = {
	title: "Templates/Building Viewer/3D Viewer/Capture UI (Beta)",
	component: SingleHouseView,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		// Live WebGL + a fetched .frag model — not deterministic, so don't snapshot it.
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component:
					"The villa-level capture experience recreated from the Site Viewer: the real 3D villa model with the " +
					"Capture app's actual left floor panel (Floor / Schedule / LBS tabs, real villa schedule) and right " +
					"inspectors (Project / Floor / Object), wired to storey isolation + ghosting and the 4D timeline. " +
					"This is `SingleHouseView` from prototypes/capture — SiteViewer's house-level view mounted on its own, " +
					"without the site map.",
			},
		},
	},
} satisfies Meta<typeof SingleHouseView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The live villa-level view: real floor panel + inspectors around the 3D model. */
export const Default: Story = {
	render: () => (
		<TooltipProvider>
			<div className="wwc:h-screen wwc:w-full">
				<SingleHouseView />
			</div>
		</TooltipProvider>
	),
};
