import type {Meta, StoryObj} from "storybook/internal/types";

import {BlueprintViewer} from "@corensystem/coren-ui/pages/core-blueprint-viewer";

import manifest from "../../../../manifests/blueprint-viewer.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// The Default story renders the real page component — deterministic SVG floor plans (no live map
// tiles), so it snapshots cleanly in Chromatic. The docs page shows the template manifest contract.
const meta = {
	title: "Templates/Building Viewer/Blueprint Viewer/Single Floor",
	component: BlueprintViewer,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>core-blueprint-viewer</code> (composes <strong>CanvasNavigator</strong> +{" "}
							<strong>VerticalZoomTools</strong> + <strong>BuildingProgress</strong>). The <em>Single Floor</em>{" "}
							variation of the <strong>Building Viewer</strong>
							template's <strong>Blueprint Viewer</strong> variant — single-floor viewing with a Show-Multiple split
							toggle. Sibling variation: <em>Multi-Floor Split</em> (<code>core-blueprint-viewer-3</code>).
						</>
					}
				/>
			),
			description: {
				component:
					"A single-blueprint viewing workspace: a pan/zoom SVG floor-plan canvas with a searchable floor navigator, a 'Show Multiple' split view, zoom tools, and a full-height Building Progress side panel. Deterministic SVG plans (no live map). Canonical: `core-blueprint-viewer`.",
			},
		},
	},
} satisfies Meta<typeof BlueprintViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen">
			<BlueprintViewer />
		</div>
	),
};
