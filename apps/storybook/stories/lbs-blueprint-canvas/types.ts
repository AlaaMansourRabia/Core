import type {CanvasObject, CanvasObjectType} from "./canvas-object-types";

export type Point = {
	x: number;
	y: number;
};

export type Size = {
	width: number;
	height: number;
};

export type ImageLayout = {
	x: number;
	y: number;
	width: number;
	height: number;
	naturalWidth: number;
	naturalHeight: number;
};

export type ShapeTool = "select" | "pan" | "polygon" | "extruded-polygon" | "rectangle" | "line";

export type ShapeKind = CanvasObjectType;

export type CanvasObjectOrderAction = "forward" | "backward" | "front" | "back";

export type CanvasObjectRenderMode = "flat" | "extruded";
export type CanvasObjectExtrusionOrigin = "base" | "top";

export type CanvasObjectVertexHandle = {
	kind: "base" | "top";
	index: number;
	point: Point;
};

export type CanvasObjectExtrusionHandle = {
	kind: "extrusion";
	face: "base" | "top";
	anchorPoint: Point;
	point: Point;
};

export type DragDraft = {
	type: Extract<ShapeKind, "Rectangle" | "Line">;
	start: Point;
	current: Point;
};

export type PendingCreateDraft = {
	type: ShapeKind;
	points: Point[];
	renderMode?: CanvasObjectRenderMode;
	extrusionOrigin?: CanvasObjectExtrusionOrigin;
	extrudedSecondaryPoints?: Point[];
};

export type AssignmentDialogState =
	| {
			mode: "create";
			draft: PendingCreateDraft;
	  }
	| {
			mode: "update";
			shape: CanvasObject;
	  };

export type DraftStyle = {
	strokeEnabled: boolean;
	strokeColor: string;
	fillEnabled: boolean;
	fillColor: string;
	opacity: number;
};

export type LbsLinkOption = {
	id: number;
	code: string;
	name: string;
	depth: number;
	objectType?: string;
	hierarchyLevel?: number;
};
