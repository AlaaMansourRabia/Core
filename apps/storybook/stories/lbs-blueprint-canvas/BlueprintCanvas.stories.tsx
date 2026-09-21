import type {Meta, StoryObj} from "@storybook/react-vite";

import {useState} from "react";
import {fn} from "storybook/test";

// Unprefixed Tailwind utilities for the widget's plain classes (see tailwind.css).
import "./tailwind.css";
import {BlueprintCanvasStoryHarness} from "./BlueprintCanvasStoryHarness";
import {MOCK_LBS_NODE, MOCK_SHAPES, SAMPLE_IMAGE_URL} from "./fixtures";

// The LBS right-hand blueprint drawing canvas, lifted out of the app into a self-contained Storybook
// harness (no API, no auth). The Konva render surface, shape/draft renderers, toolbar, viewport
// controls, context menu, geometry utils, and Zustand UI store are the real production code, imported
// unchanged; only the controller's data hooks + permission gate are swapped for local state + a
// `canEdit` arg (see BlueprintCanvasStoryHarness).
//
// Try it: toggle Edit, draw a Rectangle/Line (drag) or Polygon/2.5D (click vertices, click the first
// point or "Finish" to close), hold Shift or leave 90° on for orthogonal snap, wheel to zoom to the
// cursor, drag empty canvas to pan, select a shape to drag it or its vertex handles, right-click for
// the context menu. View mode hides the tools but keeps pan/zoom. The Upload story swaps the image.
const meta = {
	title: "Widgets/Canvas/Blueprint Drawing Canvas",
	component: BlueprintCanvasStoryHarness,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		// Live canvas with a fetched image + local drawing state — not a deterministic snapshot target.
		chromatic: {disableSnapshot: true},
	},
	// The editor self-measures via ResizeObserver on an absolute-inset host, so it needs a parent with an
	// explicit non-zero height or `getContainedImageLayout` returns null and nothing renders. Inline style
	// guarantees the height regardless of which Tailwind layer is active.
	decorators: [
		(Story) => (
			<div style={{position: "relative", height: "100vh", width: "100%"}}>
				<Story />
			</div>
		),
	],
	argTypes: {
		canEdit: {control: "boolean", description: "Edit permission — false renders read-only (View mode)."},
		alt: {control: "text"},
	},
	args: {
		downloadUrl: SAMPLE_IMAGE_URL,
		alt: "Villa VL4 — floor plan",
		initialShapes: MOCK_SHAPES,
		selectedNode: MOCK_LBS_NODE,
		canEdit: true,
		onImportOpenSpace: fn(),
		onSelectFromLibrary: fn(),
		onUnlink: fn(),
	},
} satisfies Meta<typeof BlueprintCanvasStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full drawing tools: rectangle, line, polygon, 2.5D, select/drag/resize, pan/zoom. */
export const EditMode: Story = {
	args: {canEdit: true},
};

/** Read-only: the permission gate forces edit mode off. Tools are hidden; pan and wheel-zoom still work. */
export const ViewMode: Story = {
	args: {canEdit: false},
};

/** No seeded shapes — start from a blank blueprint and draw. */
export const EmptyCanvas: Story = {
	args: {initialShapes: []},
};

/**
 * Adds a "Browse" file input that loads a local image via `URL.createObjectURL` and feeds it in as the
 * blueprint. Production loads the raster from a URL (`downloadUrl`); this demonstrates the upload path.
 */
export const Upload: Story = {
	args: {initialShapes: []},
	render: (args) => {
		function UploadHarness() {
			const [url, setUrl] = useState(args.downloadUrl);
			return (
				<>
					<label
						style={{
							position: "absolute",
							bottom: 12,
							left: 12,
							zIndex: 60,
							display: "inline-flex",
							alignItems: "center",
							gap: 8,
							padding: "6px 12px",
							borderRadius: 8,
							background: "var(--background)",
							color: "var(--foreground)",
							border: "1px solid var(--border)",
							boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
							fontSize: 13,
							cursor: "pointer",
						}}
					>
						Browse image…
						<input
							type="file"
							accept="image/*"
							style={{display: "none"}}
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) setUrl(URL.createObjectURL(file));
							}}
						/>
					</label>
					<BlueprintCanvasStoryHarness {...args} downloadUrl={url} onImageUpload={setUrl} />
				</>
			);
		}
		return <UploadHarness />;
	},
};
