import type {Meta, StoryObj} from "storybook/internal/types";

import workerUrl from "@thatopen/fragments/worker?url";
import {FragmentViewer, FragmentViewerProvider} from "@wakecap/core-ui/fragment-viewer";
import {Workforce} from "@wakecap/core-ui/pages/core-workforce";

import manifest from "../../../../manifests/workforce.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Workforce — the workforce scaffold: the same shell as Safety Manager (CoreAppSidebar +
// CoreAppTopBar with a single "Workforce" entry) and a route header carrying seven placeholder
// tabs — Analytics, Workers List, Crews, OBS, Map View, Submissions, Compliance — plus a Settings
// icon action that swaps the content area for a SideMenu settings sub-surface.
const meta = {
	title: "Templates/Workforce",
	component: Workforce,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>workforce</code>. A workforce app shell — CoreAppSidebar + CoreAppTopBar with a single
							"Workforce" entry and a description-less route header: title, seven tabs (Analytics, Workers List, Crews,
							OBS, Map View, Submissions, Compliance), and a Settings action that opens a SideMenu settings sub-surface
							(Trade, Workshifts, Discipline, Location Group, Card Generator, plus an Ontology section: Object types,
							Link types, Action types, Interfaces, Shared properties, Type groups). Tab and setting bodies are
							placeholders for now.
						</>
					}
				/>
			),
			description: {
				component:
					"The workforce scaffold. It owns its own app shell (single sidebar entry + top bar) and a " +
					"description-less PageContentHeader with seven placeholder tabs — Analytics, Workers List, Crews, OBS, " +
					"Map View, Submissions, and Compliance — plus a Settings action that swaps the content area for a SideMenu settings " +
					"sub-surface (Trade, Workshifts, Discipline, Location Group, Card Generator, plus an Ontology section: " +
					"Object types, Link types, Action types, Interfaces, Shared properties, Type groups), ready for the real " +
					"workforce surfaces to fill in.",
			},
		},
	},
} satisfies Meta<typeof Workforce>;

export default meta;
type Story = StoryObj<typeof meta>;

// The 3D-model stage — just the FragmentViewer canvas. The Workforce template overlays its own compact
// view controls (Orbit / Fit / Ortho / Shading / Ghost + Workers) beside the 3D/2D switch, so this
// surface omits the large ViewerToolbar.
function MapStage() {
	return (
		<div className="wwc:absolute wwc:inset-0">
			<FragmentViewer
				src="/models-bundled/uptown.frag"
				fallbackSrc="/models/vd2.frag"
				modelId="uptown"
				workerUrl={workerUrl}
				showLogo={false}
				selectFloorsOnly
			/>
		</div>
	);
}

export const Default: Story = {
	// Live WebGL only mounts when the Map View tab is opened, so the default (Analytics) snapshot
	// stays deterministic; disable the snapshot anyway since the model is fetched at runtime.
	parameters: {chromatic: {disableSnapshot: true}},
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<FragmentViewerProvider>
				<Workforce mapStage={<MapStage />} />
			</FragmentViewerProvider>
		</div>
	),
};
