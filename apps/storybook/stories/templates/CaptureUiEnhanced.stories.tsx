import type {Meta, StoryObj} from "storybook/internal/types";

import {CaptureUiEnhanced} from "@core/core-ui/pages/capture-ui-enhanced";

import manifest from "../../../../manifests/capture-ui-enhanced.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// A reality-capture progress workspace for a construction zone: a CanvasHeader (breadcrumb +
// week/capture selector + refresh & full-screen) over a three-pane body — a left rail (search, zone
// progress, distribution histogram, villas-on-map list, collapsible map-layer toggles), a center
// choropleth map of plot polygons + amenities, and a right detail rail for the selected villa
// (approved/planned/variance, milestones, progress-by-floor, evidence chain). The Default story
// renders the real page; the docs page shows the template manifest contract.
const meta = {
	title: "Templates/Capture UI Enhanced",
	component: CaptureUiEnhanced,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>capture-ui-enhanced</code>. A reality-capture zone progress workspace composing{" "}
							<strong>CanvasHeader</strong> (with its built-in <strong>WeekSelector</strong>) +{" "}
							<strong>Breadcrumb</strong> over a left rail (<strong>Input</strong> · <strong>Collapsible</strong> ·{" "}
							<strong>Switch</strong>), a choropleth map (<strong>Tabs</strong>), and a villa detail rail.
							Self-contained demo data; no variants/instances.
						</>
					}
				/>
			),
			description: {
				component:
					"A reality-capture progress workspace for a construction zone: a CanvasHeader (breadcrumb + week/capture selector + refresh & full-screen), a left rail (search, zone progress, a progress-distribution histogram, a villas-on-map list, and collapsible map-layer toggles), a center choropleth map of plot polygons + amenities with a floating view-mode switcher and an approved-progress legend, and a right detail rail for the selected villa (approved/planned/variance, milestones, progress-by-floor, evidence chain). Selecting a plot opens its detail; 'View blueprints' opens a per-floor sheet dialog. Canonical: `capture-ui-enhanced`.",
			},
		},
	},
} satisfies Meta<typeof CaptureUiEnhanced>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen">
			<CaptureUiEnhanced />
		</div>
	),
};
