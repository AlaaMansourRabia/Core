import type {MapMode} from "@corensystem/coren-ui/site-image-viewer";
import type {Meta, StoryObj} from "storybook/internal/types";

import {
	BuildingViewer,
	type BuildingViewerMapData,
	type LevelId,
	type ViewId,
	type ViewMode,
} from "@corensystem/coren-ui/building-viewer";
import {ALMANAR_SITE_META, ALMANAR_VILLAS} from "@corensystem/coren-ui/site-image-viewer-fixtures";
import {TooltipProvider} from "@corensystem/coren-ui/tooltip";
import {useState} from "react";

// The canvas widget: it composes the 2D site-image-viewer (Plan mode) and the projected-footprints
// mesh reality viewer (Reality/3D mode) behind one controlled surface. The old IFC "3D model" was
// replaced by the footprint mesh, so "3D model" and "footprint mesh" are the same viewer here.
const MAP: BuildingViewerMapData = {
	villas: ALMANAR_VILLAS,
	backgroundUrl: "/site-background.webp",
	imageWidth: ALMANAR_SITE_META.imageWidth,
	imageHeight: ALMANAR_SITE_META.imageHeight,
	contentKey: "villa-batch",
};

const meta = {
	title: "Widgets/BuildingViewer",
	component: BuildingViewer,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		// Reality mode mounts live WebGL (the footprint mesh) — not deterministic, so don't snapshot.
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component:
					"The canvas widget extracted from the Capture UI Enhanced template. One controlled surface over two renderers: the 2D site-image-viewer (Plan) and the projected-footprints mesh reality viewer (Reality/3D). Fully controlled — reads the view/mode/level axes + all layer flags as props and requests changes via on* callbacks. The Reality story mounts live WebGL, so it renders only in a real browser (a headless check shows the '3D model unavailable' fallback).",
			},
		},
	},
} satisfies Meta<typeof BuildingViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({initialMode}: {initialMode: ViewMode}) {
	const [mode, setMode] = useState<ViewMode>(initialMode);
	const [mapMode, setMapMode] = useState<MapMode>("progress");
	const [mesh3dOn, setMesh3dOn] = useState(true);
	const [model3dOn, setModel3dOn] = useState(false);
	const [model3dOpacity, setModel3dOpacity] = useState(1);
	const [progressColours, setProgressColours] = useState(true);
	const [showLabels, setShowLabels] = useState(true);
	const [showPolygons, setShowPolygons] = useState(true);

	const view: ViewId = "villa";
	const level: LevelId = "batch";

	return (
		<TooltipProvider>
			{/* BuildingViewer's root is `flex-1` — it expects a flex parent with a height (the template's
			    body row). Give it exactly that so the map fills the frame instead of collapsing to 0px. */}
			<div className="wwc:relative wwc:flex wwc:h-screen wwc:w-full wwc:overflow-hidden wwc:bg-muted">
				{/* Local mode switch so you can flip Plan ↔ Reality without the full template */}
				<div className="wwc:absolute wwc:left-3 wwc:top-3 wwc:z-30 wwc:flex wwc:gap-1 wwc:rounded-md wwc:bg-background/90 wwc:p-1 wwc:shadow">
					{(["3d", "plan"] as ViewMode[]).map((m) => (
						<button
							key={m}
							onClick={() => setMode(m)}
							className={
								"wwc:rounded wwc:px-2 wwc:py-1 wwc:text-xs " +
								(mode === m ? "wwc:bg-primary wwc:text-primary-foreground" : "wwc:text-muted-foreground")
							}
						>
							{m === "3d" ? "Reality" : "Plan"}
						</button>
					))}
				</div>

				<BuildingViewer
					mode={mode}
					view={view}
					level={level}
					currentLocation="Batch 1"
					isParent={false}
					map={MAP}
					satelliteBasemap={null}
					mapMode={mapMode}
					mesh3dOn={mesh3dOn}
					mesh3dOpacity={1}
					model3dOn={model3dOn}
					model3dOpacity={model3dOpacity}
					progressColours={progressColours}
					showLabels={showLabels}
					showPolygons={showPolygons}
					keep3dMounted
					mapScaledOut={false}
					mapBlurred={false}
					showSpinner={false}
					chromeHidden={false}
					chromeFade=""
					reportScrollY={0}
					jumpToast={null}
					jumpToastLeaving={false}
					layersOffsetLeft={12}
					polyNoun="Villas"
					onSelectVilla={() => {}}
					onDrillDown={() => {}}
					onMapModeChange={setMapMode}
					onViewerReady={() => {}}
					onMesh3dOnChange={setMesh3dOn}
					onModel3dOnChange={setModel3dOn}
					onModel3dOpacityChange={setModel3dOpacity}
					onProgressColoursChange={setProgressColours}
					onShowLabelsChange={setShowLabels}
					onShowPolygonsChange={setShowPolygons}
				/>
			</div>
		</TooltipProvider>
	);
}

/** Plan mode — the 2D site-image-viewer (villa polygons coloured by the milestone ramp). Renders headless. */
export const Plan: Story = {
	render: () => <Harness initialMode="plan" />,
};

/** Reality mode — the projected-footprints mesh viewer (live WebGL; view in a real browser). */
export const Reality: Story = {
	render: () => <Harness initialMode="3d" />,
};
