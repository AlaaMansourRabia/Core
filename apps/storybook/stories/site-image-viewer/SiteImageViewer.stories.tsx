import type {Meta, StoryObj} from "@storybook/react-vite";

import {SiteImageViewer} from "@corensystem/coren-ui/site-image-viewer";
import {
	ALMANAR_SITE_META,
	ALMANAR_VILLAS,
	ALMANAR_ZONE_A_BLOCKS,
} from "@corensystem/coren-ui/site-image-viewer-fixtures";
import {fn, userEvent} from "storybook/test";

// Site Image Viewer — the real ROSHN Almanar site aerial (blueprint "Zone 1 - A", 4096×4096) with the
// real villa footprint polygons overlaid and coloured by the SHA-1036 milestone ramp from live progress;
// hovering a linked villa raises its stroke + name chip and pops a floating progress card (the DS
// `ProgressComparison`). The `TabbedLegend` doubles as the SPA/Construction mode switch. Pure SVG — no
// Konva, no map engine. Now shipped as `@corensystem/coren-ui/site-image-viewer`; the real villa data is the
// separate `@corensystem/coren-ui/site-image-viewer-fixtures` payload.
const meta = {
	title: "Templates/Building Viewer/Site Viewer/Site Image Viewer",
	component: SiteImageViewer,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		// Live hover interaction, not a deterministic snapshot target.
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component:
					"The real ROSHN Almanar site aerial (blueprint “Zone 1 - A”) with the real villa footprint " +
					"polygons overlaid and coloured by construction progress (the milestone ramp): linked villas colour " +
					"by their approved %, unlinked render grey, linked-but-no-progress render slate. Hover a villa to " +
					"highlight it and pop a floating progress card (Approved vs Planned via the DS `ProgressComparison`). " +
					"The `TabbedLegend` (top-right) keys the colours and switches SPA (progress) ↔ Construction " +
					"(variance). Pure SVG overlay — the `viewBox` equals the image's pixel size (4096×4096), so villa " +
					"points map 1:1 with no coordinate math.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="wwc:relative wwc:h-screen wwc:w-full">
				<Story />
			</div>
		),
	],
	argTypes: {
		mapMode: {control: "inline-radio", options: ["progress", "variance"]},
	},
	args: {
		backgroundUrl: "/site-background.webp",
		villas: ALMANAR_VILLAS,
		blocks: ALMANAR_ZONE_A_BLOCKS,
		imageWidth: ALMANAR_SITE_META.imageWidth,
		imageHeight: ALMANAR_SITE_META.imageHeight,
		mapMode: "progress",
		onNavigate: fn(),
	},
} satisfies Meta<typeof SiteImageViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** SPA / progress mode: villas coloured by approved % across the M35–M100 ramp. */
export const ProgressMode: Story = {};

/** Construction / variance mode: villas coloured behind / on-track / ahead of plan (±2.5%). */
export const VarianceMode: Story = {
	args: {mapMode: "variance"},
};

/**
 * A villa preselected as hovered so the inline highlight (raised stroke + name chip) is visible without
 * moving the mouse. No floating card — hover is inline only.
 */
export const SingleVillaHovered: Story = {
	args: {initialHoveredId: 3029},
	play: async ({canvasElement}) => {
		const villa = canvasElement.querySelector<SVGPolygonElement>('polygon[data-villa-id="3029"]');
		if (villa) await userEvent.hover(villa);
	},
};

/**
 * Block → villa label LOD (mirrors the 3D reality view). Fully zoomed out, the map shows one **block-name**
 * chip per block hull; zoom in past 10% (wheel or the `+` control) and the per-villa number chips take over.
 * Pass `blocks` (block hull polygons in the same pixel space — `ALMANAR_ZONE_A_BLOCKS`) to opt in; omit it for
 * the classic "villa labels always" behaviour. Only the labels swap — the villa polygon overlay stays drawn.
 */
export const BlockToVillaLabels: Story = {
	args: {blocks: ALMANAR_ZONE_A_BLOCKS},
};
