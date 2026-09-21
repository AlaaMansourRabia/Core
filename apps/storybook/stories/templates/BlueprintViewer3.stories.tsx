import type {Meta, StoryObj} from "storybook/internal/types";

import {BlueprintViewer3} from "@wakecap/core-ui/pages/core-blueprint-viewer-3";

import manifest from "../../../../manifests/blueprint-viewer-3.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// A v3 blueprint-viewer workspace: a fixed multi-floor split canvas (drag to pan) with a collapsed
// compound → house drill navigator and a scrollable full-height details panel. The Default story renders
// the real page (deterministic inline SVG); the docs page shows the template manifest contract.
const meta = {
	title: "Templates/Building Viewer/Blueprint Viewer/Multi-Floor Split",
	component: BlueprintViewer3,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>core-blueprint-viewer-3</code>. The <em>Multi-Floor Split</em> variation of the{" "}
							<strong>Building Viewer</strong> template&apos;s <strong>Blueprint Viewer</strong> variant (fixed
							multi-floor split canvas + compound→house drill navigator + milestones/progress side panel) composing{" "}
							<strong>CanvasNavigator</strong> + <strong>BuildingProgress</strong> + <strong>WeekSelector</strong> +{" "}
							<strong>Breadcrumb</strong>. Sibling variation: <em>Single Floor</em> (<code>core-blueprint-viewer</code>
							).
						</>
					}
				/>
			),
			description: {
				component:
					"A v3 blueprint-viewer layout: a fixed multi-floor split canvas (drag to pan), a collapsed compound → zone → house → floor navigator (top-left), and a scrollable full-height details panel (approved-vs-planned progress, a collapsible milestones table, and a Building Progress floor list). Breadcrumb + week-selector metric bar with a full-screen toggle. Canonical: `core-blueprint-viewer-3`.",
			},
		},
	},
} satisfies Meta<typeof BlueprintViewer3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen">
			<BlueprintViewer3 />
		</div>
	),
};
