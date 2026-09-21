import type {Meta, StoryObj} from "storybook/internal/types";

import workerUrl from "@thatopen/fragments/worker?url";
import {BuildingViewer} from "@core/core-ui/pages/core-building-viewer";

// The "Main Views" variation of the Building Viewer template's 3D Viewer — the 3D sibling of the
// Blueprint Viewer, built from the main core-ui views (BuildingProgress + WeekSelector chrome). The
// Default story renders the empty stage (deterministic, snapshots cleanly); the WithModel story
// mounts the real ThatOpen villa model (live WebGL, snapshot disabled).
const meta = {
	title: "Templates/Building Viewer/3D Viewer/Main Views",
	component: BuildingViewer,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A villa/building 3D viewing workspace: the villa's real ThatOpen model (`FragmentViewer`) with a " +
					"floor-progress side panel and a week header. The Villa Viewer variation of the Building Viewer " +
					"template — the 3D sibling of the Blueprint Viewer (2D SVG floor plans). Based on the Capture app's " +
					"villa-level page. Canonical: `core-building-viewer`. Pass `workerUrl` " +
					'(`import workerUrl from "@thatopen/fragments/worker?url"`) to mount the model.',
			},
		},
	},
} satisfies Meta<typeof BuildingViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Deterministic empty stage (no live WebGL) — the header + progress panel chrome, snapshot-safe. */
export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen">
			<BuildingViewer />
		</div>
	),
};

/** The stage filled with the real 3D villa model, driven by the viewer toolbar. */
export const WithModel: Story = {
	// Live WebGL + a fetched .frag model — not reproducible in the Chromatic CI build, and WebGL
	// snapshots drift. The Default story (no model) is still snapshotted.
	parameters: {chromatic: {disableSnapshot: true}},
	render: () => (
		<div className="wwc:h-screen">
			<BuildingViewer workerUrl={workerUrl} />
		</div>
	),
};
