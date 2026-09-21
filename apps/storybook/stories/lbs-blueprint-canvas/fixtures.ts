// Mock data for the Blueprint Canvas story harness — no app data, no API. Shapes are typed against
// the real CanvasObject; coordinates are in image pixels sized to SAMPLE_IMAGE (1600×1000).
import type {CanvasObject} from "./canvas-object-types";
import {BLUEPRINT_CANVAS_DEFAULT_STYLE} from "./constants";
import type {LbsNode} from "./lbs-types";

// A deterministic, offline floor-plan raster: an inline SVG data URL (explicit 1600×1000 so
// `new Image()` reports a natural size). Avoids a network fetch so the story renders headlessly.
const SAMPLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#ffffff"/>
  <g fill="none" stroke="#3f3f46" stroke-width="8">
    <rect x="80" y="80" width="1440" height="840"/>
  </g>
  <g fill="none" stroke="#71717a" stroke-width="4">
    <line x1="80" y1="500" x2="1520" y2="500"/>
    <rect x="80" y="80" width="420" height="420"/>
    <rect x="500" y="80" width="520" height="420"/>
    <rect x="1020" y="80" width="500" height="420"/>
    <rect x="80" y="500" width="640" height="420"/>
    <rect x="720" y="500" width="800" height="420"/>
    <line x1="300" y1="500" x2="300" y2="560"/>
    <line x1="900" y1="500" x2="900" y2="560"/>
  </g>
  <g fill="#a1a1aa" font-family="sans-serif" font-size="26">
    <text x="110" y="130">Zone A</text>
    <text x="530" y="130">Zone B</text>
    <text x="1050" y="130">Zone C</text>
    <text x="110" y="550">Zone D</text>
    <text x="750" y="550">Zone E</text>
  </g>
</svg>`.trim();

export const SAMPLE_IMAGE_URL = `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_SVG)}`;

// A minimal LBS tree — the harness reads only id/code/name/objectType/hierarchyLevel/children/childCount.
export const MOCK_LBS_NODE: LbsNode = {
	id: 1000,
	code: "VL4",
	name: "Villa Block 4",
	objectType: "Zone",
	hierarchyLevel: 0,
	childCount: 4,
	children: [
		{id: 1001, code: "VL4-A", name: "Zone A", objectType: "Area", hierarchyLevel: 1, childCount: 0, children: []},
		{id: 1002, code: "VL4-B", name: "Zone B", objectType: "Area", hierarchyLevel: 1, childCount: 0, children: []},
		{id: 1003, code: "VL4-C", name: "Zone C", objectType: "Area", hierarchyLevel: 1, childCount: 0, children: []},
		{id: 1004, code: "VL4-D", name: "Zone D", objectType: "Area", hierarchyLevel: 1, childCount: 0, children: []},
	],
};

// Fill the required CanvasObject fields once; each mock overrides the geometry-relevant bits.
const D = BLUEPRINT_CANVAS_DEFAULT_STYLE;
function shape(
	partial: Partial<CanvasObject> & Pick<CanvasObject, "id" | "name" | "type" | "x" | "y" | "width" | "height">,
): CanvasObject {
	return {
		projectId: "storybook-project",
		blueprintId: 1,
		strokeColor: D.strokeColor,
		fillColor: D.fillColor,
		opacity: D.opacity,
		zIndex: partial.id,
		rotation: 0,
		isLocked: false,
		createdAt: new Date("2026-01-01T00:00:00Z"),
		createdById: "storybook",
		...partial,
	};
}

export const MOCK_SHAPES: CanvasObject[] = [
	// Rectangle from bbox only (geometry derives 4 corners from x/y/width/height).
	shape({id: 1, name: "Zone A — slab", type: "Rectangle", x: 140, y: 150, width: 320, height: 300}),
	// Rectangle linked to an LBS item.
	shape({
		id: 2,
		name: "Zone B — pour",
		type: "Rectangle",
		x: 560,
		y: 150,
		width: 400,
		height: 300,
		linkedLbsItemId: 1002,
	}),
	// Polygon with explicit pointsJson (image px).
	shape({
		id: 3,
		name: "Zone C — form",
		type: "Polygon",
		x: 1080,
		y: 150,
		width: 380,
		height: 300,
		pointsJson: JSON.stringify([
			{x: 1090, y: 170},
			{x: 1440, y: 170},
			{x: 1460, y: 380},
			{x: 1270, y: 460},
			{x: 1080, y: 380},
		]),
	}),
	// Line (2 points).
	shape({
		id: 4,
		name: "Grid line",
		type: "Line",
		x: 150,
		y: 640,
		width: 520,
		height: 90,
		pointsJson: JSON.stringify([
			{x: 150, y: 640},
			{x: 670, y: 730},
		]),
		fillColor: undefined,
	}),
	// 2.5D extruded polygon (renderMetadataJson drives the extrusion).
	shape({
		id: 5,
		name: "Zone E — riser (2.5D)",
		type: "Polygon",
		x: 780,
		y: 560,
		width: 640,
		height: 300,
		pointsJson: JSON.stringify([
			{x: 800, y: 600},
			{x: 1360, y: 600},
			{x: 1360, y: 820},
			{x: 800, y: 820},
		]),
		renderMetadataJson: JSON.stringify({renderMode: "extruded", extrusionOrigin: "top"}),
		opacity: 0.5,
	}),
	// A locked shape (handles hidden, cannot edit).
	shape({id: 6, name: "Zone D — locked", type: "Rectangle", x: 150, y: 560, width: 260, height: 300, isLocked: true}),
];
