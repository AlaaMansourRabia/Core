import type {Meta, StoryObj} from "storybook/internal/types";

import workerUrl from "@thatopen/fragments/worker?url";
import {FragmentViewer, FragmentViewerProvider} from "@wakecap/core-ui/fragment-viewer";
import {ViewerToolbar} from "@wakecap/core-ui/viewer-toolbar";

import manifest from "../../../../manifests/fragment-viewer.widget.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Three.js / FragmentViewer — a Fragments (.frag) model with orbit, zoom and click-to-select.
// UpTown is bundled with Storybook so the primary example never depends on an external dataset.
const meta = {
	title: "Widgets/Three.js/Fragment Viewer",
	component: FragmentViewer,
	excludeStories: ["wakecoreInventory"],
	parameters: {
		layout: "fullscreen",
		// These stories spin up a live WebGL canvas and fetch a .frag model. WebGL snapshots are
		// non-deterministic, so the visual snapshot remains disabled even though UpTown is bundled.
		chromatic: {disableSnapshot: true},
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>fragment-viewer</code>. Wraps <code>three</code> + <code>@thatopen/fragments</code> — the
							same runtime the WC3 engineering viewers use — and reports the picked element back to React. Both
							libraries are <em>optional</em> peer dependencies.
						</>
					}
				/>
			),
			description: {
				component:
					"Renders the bundled UpTown model without third-party canvas branding. Requires a `workerUrl`: a bundled library cannot resolve " +
					"`@thatopen/fragments/worker` to a runtime URL, so Vite consumers pass " +
					'`import workerUrl from "@thatopen/fragments/worker?url"`. Give the parent a bounded height — ' +
					"the canvas fills its container.",
			},
		},
	},
} satisfies Meta<typeof FragmentViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const wakecoreInventory = {
	templates: [],
	widgets: ["fragment-viewer", "viewer-toolbar"],
	components: [],
	tokens: [],
} as const;

function UpTownFragmenter() {
	return (
		<FragmentViewerProvider>
			<div
				className="wwc:relative wwc:h-screen wwc:w-full wwc:overflow-hidden"
				data-wakecore-shell="threejs-fragmenter"
				data-wakecore-artifact="fragment-viewer"
				data-wakecore-density="comfortable"
				data-wakecore-brand="wakecore"
				data-wakecore-navigation-fingerprint="standalone-fragmenter"
				data-wakecore-provider-owner="fragment-viewer-provider"
				data-wakecore-content-scroll="false"
				data-wakecore-region="fragmenter-viewport"
				data-wakecore-surface-owner="artifact"
				data-wakecore-canvas-capabilities="orbit, pan, zoom, fit-to-view, selection, orthographic, clipping, measurement, levels, hide, isolate, show-all"
				data-wakecore-observable-state-changed="true"
				data-wakecore-interaction="Initial UpTown.ifc load"
			>
				<FragmentViewer
					src="/models-bundled/uptown.frag"
					modelId="uptown"
					workerUrl={workerUrl}
					showLogo={false}
					data-wakecore-interaction="Model selection"
				/>
				<div
					className="wwc:absolute wwc:inset-x-0 wwc:bottom-11 wwc:flex wwc:h-0 wwc:items-end wwc:justify-center"
					data-wakecore-responsive-group="viewer-toolbar"
					data-wakecore-responsive-atomic="true"
				>
					<ViewerToolbar className="wwc:max-w-full wwc:shadow-lg" data-wakecore-interaction="Camera navigation" />
				</div>
			</div>
		</FragmentViewerProvider>
	);
}

/** The user-provided UpTown.ifc, converted to Fragments and bundled as the primary example. */
export const Default: Story = {
	name: "UpTown (Default)",
	args: {
		src: "/models-bundled/uptown.frag",
		modelId: "uptown",
		workerUrl,
		showLogo: false,
	},
	render: () => <UpTownFragmenter />,
};

/** VD2 — a WC3 villa: 942 elements, 1.2 MB. A much smaller model, for comparison. */
export const Wc3Villa: Story = {
	args: {src: "/models/vd2.frag", modelId: "vd2", workerUrl, showLogo: false},
	render: (args) => (
		<div className="wwc:h-screen wwc:w-full">
			<FragmentViewer {...args} />
		</div>
	),
};

/** A missing model resolves to the error state rather than a blank canvas. */
export const NotFound: Story = {
	args: {src: "/models/does-not-exist.frag", modelId: "missing", workerUrl, showLogo: false},
	render: (args) => (
		<div className="wwc:h-screen wwc:w-full">
			<FragmentViewer {...args} />
		</div>
	),
};
