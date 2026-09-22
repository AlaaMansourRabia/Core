import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@corensystem/core-ui/badge";
import {
	FragmentViewer,
	FragmentViewerProvider,
	useFragmentViewer,
	type FragmentSelection,
} from "@corensystem/core-ui/fragment-viewer";
import {SiteReality} from "@corensystem/core-ui/pages/core-site-reality";
import {PropertyList, PropertyRow} from "@corensystem/core-ui/property-list";
import {SectionPanel} from "@corensystem/core-ui/section-panel";
import {ViewerToolbar} from "@corensystem/core-ui/viewer-toolbar";
import workerUrl from "@thatopen/fragments/worker?url";
import {Boxes} from "lucide-react";

import manifest from "../../../../manifests/site-reality.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Site Reality — the live-site map command surface: CoreAppSidebar + CoreAppTopBar with a single
// "Site Reality" entry, a full-width headline stat strip, and a three-column body (Insights Map
// panel / empty map stage / PushPanel context column). The Default story is the live preview.
const meta = {
	title: "Templates/Site Reality",
	component: SiteReality,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>site-reality</code>. A live-site app shell — CoreAppSidebar + CoreAppTopBar with a single
							"Site Reality" entry, a headline stat strip (connected, online, active, inactive, manhours), and a
							three-column body: the Insights Map panel (levels + toggleable layers), an intentionally empty map stage,
							and a PushPanel context column (weather, manpower by shift, equipment).
						</>
					}
				/>
			),
			description: {
				component:
					"The live-site map scaffold. It owns its own app shell and both flanking panels, and leaves the map stage " +
					"empty so a real engine (the Map component, Cesium, or a That Open world) mounts straight into it. Both " +
					"side panels collapse into the stage; every figure shown is a placeholder fixture.",
			},
		},
	},
} satisfies Meta<typeof SiteReality>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<SiteReality />
		</div>
	),
};

/** The picked element, shown at the top of the context column. */
function SelectedElement({selection}: {selection: FragmentSelection | null}) {
	return (
		<SectionPanel
			icon={Boxes}
			title="Selected element"
			count={selection?.itemCount ? <Badge variant="secondary">{selection.itemCount}</Badge> : undefined}
		>
			{!selection || selection.itemCount === 0 ? (
				<p className="wwc:text-xs wwc:text-muted-foreground">Click an element in the model.</p>
			) : (
				<PropertyList labelWidth="5.5rem">
					<PropertyRow label="Category">{selection.category ?? "Unknown"}</PropertyRow>
					<PropertyRow label="Selected">{selection.itemCount}</PropertyRow>
					<PropertyRow label="GUID">
						<span className="wwc:break-all wwc:font-mono wwc:text-xs">{selection.guid ?? "—"}</span>
					</PropertyRow>
				</PropertyList>
			)}
		</SectionPanel>
	);
}

/** Canvas plus the floating ViewerToolbar — the toolbar is a sibling, not part of the viewer. */
function Stage() {
	return (
		<div style={{position: "absolute", inset: 0}}>
			<FragmentViewer
				src="/models/uptown.frag"
				fallbackSrc="/models/vd2.frag"
				modelId="uptown"
				workerUrl={workerUrl}
				showLogo={false}
			/>
			<div
				style={{
					// Full width so the toolbar can measure the stage and pick its own density, but
					// zero-height so the wrapper has no hit area over the canvas — the toolbar child
					// overflows upward and is the only thing that receives clicks.
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 44,
					height: 0,
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-end",
				}}
			>
				<ViewerToolbar className="wwc:max-w-full wwc:shadow-lg" />
			</div>
		</div>
	);
}

function ContextHeader() {
	const {state} = useFragmentViewer();
	return <SelectedElement selection={state.selection} />;
}

function SiteRealityWithModel() {
	return (
		<div className="wwc:h-screen wwc:w-full">
			<FragmentViewerProvider>
				<SiteReality stage={<Stage />} contextHeader={<ContextHeader />} />
			</FragmentViewerProvider>
		</div>
	);
}

/** The stage filled with a real architectural model, driven by the viewer toolbar. */
export const WithModel: Story = {
	// Live WebGL + a fetched .frag model — not reproducible in the Chromatic CI build, and WebGL
	// snapshots drift. The plain Default story (no model) is still snapshotted.
	parameters: {chromatic: {disableSnapshot: true}},
	render: () => <SiteRealityWithModel />,
};
