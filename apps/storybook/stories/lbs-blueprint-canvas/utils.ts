import type {CanvasObject, CreateCanvasObject} from "./canvas-object-types";
import {clamp} from "./clamp";
import {
	BLUEPRINT_COORDINATE_MIN,
	BLUEPRINT_COORDINATE_ROUNDING_FACTOR,
	BLUEPRINT_EMPTY_BOUNDS,
	BLUEPRINT_EXTRUDED_FACE_MAX_OFFSET,
	BLUEPRINT_EXTRUDED_FACE_MIN_OFFSET,
	BLUEPRINT_EXTRUDED_FACE_OFFSET_FACTOR,
	BLUEPRINT_EXTRUDED_FACE_OFFSET_X_FACTOR,
	BLUEPRINT_IMAGE_LAYOUT_CENTER_DIVISOR,
	BLUEPRINT_LABEL_DEFAULT_FONT_SIZE,
	BLUEPRINT_LABEL_CENTER_DIVISOR,
	BLUEPRINT_LABEL_HEIGHT_FACTOR,
	BLUEPRINT_LABEL_MAX_HEIGHT,
	BLUEPRINT_LABEL_MAX_WIDTH,
	BLUEPRINT_LABEL_MIN_HEIGHT,
	BLUEPRINT_LABEL_MIN_WIDTH,
	BLUEPRINT_LABEL_SMALL_FONT_SIZE,
	BLUEPRINT_LABEL_SMALL_SHAPE_HEIGHT,
	BLUEPRINT_LABEL_SMALL_SHAPE_WIDTH,
	BLUEPRINT_LABEL_WIDTH_FACTOR,
	BLUEPRINT_LINK_OPTION_DEPTH_STEP,
	BLUEPRINT_LINK_OPTION_MIN_VISIBLE_DEPTH,
	BLUEPRINT_POLYGON_MIN_POINTS,
	BLUEPRINT_SHAPE_DEFAULT_ROTATION,
	BLUEPRINT_SHAPE_DEFAULT_Z_INDEX,
	BLUEPRINT_SHAPE_MIN_DRAW_SIZE,
	BLUEPRINT_SHAPE_Z_INDEX_STEP,
} from "./constants";
import type {LbsNode} from "./lbs-types";
import type {
	CanvasObjectExtrusionHandle,
	CanvasObjectExtrusionOrigin,
	CanvasObjectOrderAction,
	CanvasObjectRenderMode,
	CanvasObjectVertexHandle,
	DraftStyle,
	ImageLayout,
	LbsLinkOption,
	Point,
	ShapeTool,
	Size,
} from "./types";

const CANVAS_OBJECT_RENDER_METADATA_PREFIX = "capture:canvas-object-render:";
const HEX_COLOR_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export type CanvasObjectRenderMetadata = {
	renderMode?: CanvasObjectRenderMode;
	extrusionOrigin?: CanvasObjectExtrusionOrigin;
	topPoints?: Point[];
	basePoints?: Point[];
};

export type ExtrudedPolygonFace = {
	points: Point[];
	shadeIndex: number;
};

export type CanvasObjectExtrudedSecondaryPoints = {
	face: "base" | "top";
	points: Point[];
	explicit: boolean;
};

export function getCanvasObjectOrderZIndex(
	selectedShape: CanvasObject,
	shapes: CanvasObject[],
	action: CanvasObjectOrderAction,
): number {
	if (action === "forward") {
		return selectedShape.zIndex + BLUEPRINT_SHAPE_Z_INDEX_STEP;
	}

	if (action === "backward") {
		return selectedShape.zIndex - BLUEPRINT_SHAPE_Z_INDEX_STEP;
	}

	const otherShapes = shapes.filter((shape) => shape.id !== selectedShape.id);
	if (otherShapes.length === 0) return selectedShape.zIndex;

	if (action === "front") {
		return Math.max(...otherShapes.map((shape) => shape.zIndex)) + BLUEPRINT_SHAPE_Z_INDEX_STEP;
	}

	return Math.min(...otherShapes.map((shape) => shape.zIndex)) - BLUEPRINT_SHAPE_Z_INDEX_STEP;
}

export function getContainedImageLayout(container: Size, natural: Size): ImageLayout | null {
	const scale = getImageLayoutScale(container, natural, Math.min);
	if (scale == null) return null;

	return getScaledImageLayout(container, natural, scale);
}

export function getCoveredImageLayout(container: Size, natural: Size): ImageLayout | null {
	const scale = getImageLayoutScale(container, natural, Math.max);
	if (scale == null) return null;

	return getScaledImageLayout(container, natural, scale);
}

function getImageLayoutScale(
	container: Size,
	natural: Size,
	scaleFn: (widthRatio: number, heightRatio: number) => number,
): number | null {
	if (container.width <= 0 || container.height <= 0 || natural.width <= 0 || natural.height <= 0) {
		return null;
	}

	return scaleFn(container.width / natural.width, container.height / natural.height);
}

function getScaledImageLayout(container: Size, natural: Size, scale: number): ImageLayout {
	const width = natural.width * scale;
	const height = natural.height * scale;

	return {
		x: (container.width - width) / BLUEPRINT_IMAGE_LAYOUT_CENTER_DIVISOR,
		y: (container.height - height) / BLUEPRINT_IMAGE_LAYOUT_CENTER_DIVISOR,
		width,
		height,
		naturalWidth: natural.width,
		naturalHeight: natural.height,
	};
}

export function imagePointToStagePoint(point: Point, layout: ImageLayout): Point {
	return {
		x: layout.x + (point.x / layout.naturalWidth) * layout.width,
		y: layout.y + (point.y / layout.naturalHeight) * layout.height,
	};
}

export function stagePointToImagePoint(point: Point, layout: ImageLayout): Point {
	return {
		x: clamp(
			((point.x - layout.x) / layout.width) * layout.naturalWidth,
			BLUEPRINT_COORDINATE_MIN,
			layout.naturalWidth,
		),
		y: clamp(
			((point.y - layout.y) / layout.height) * layout.naturalHeight,
			BLUEPRINT_COORDINATE_MIN,
			layout.naturalHeight,
		),
	};
}

export function isStagePointInsideImage(point: Point, layout: ImageLayout): boolean {
	return (
		point.x >= layout.x &&
		point.x <= layout.x + layout.width &&
		point.y >= layout.y &&
		point.y <= layout.y + layout.height
	);
}

export function parsePointsJson(pointsJson?: string): Point[] {
	if (!pointsJson) return [];
	try {
		const parsed = JSON.parse(pointsJson) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((p) =>
				isPointLike(p)
					? {
							x: p.x,
							y: p.y,
						}
					: null,
			)
			.filter((p): p is Point => p !== null);
	} catch {
		return [];
	}
}

export function stringifyPoints(points: Point[]): string {
	return JSON.stringify(
		points.map((point) => ({
			x: roundCoordinate(point.x),
			y: roundCoordinate(point.y),
		})),
	);
}

export function getPointBounds(points: Point[]): {
	x: number;
	y: number;
	width: number;
	height: number;
} {
	if (points.length === 0) {
		return {...BLUEPRINT_EMPTY_BOUNDS};
	}

	const xs = points.map((p) => p.x);
	const ys = points.map((p) => p.y);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

	return {
		x: roundCoordinate(minX),
		y: roundCoordinate(minY),
		width: roundCoordinate(maxX - minX),
		height: roundCoordinate(maxY - minY),
	};
}

export function flattenPoints(points: Point[]): number[] {
	return points.flatMap((point) => [point.x, point.y]);
}

export function buildCanvasObjectRenderMetadataJson(
	renderMode: CanvasObjectRenderMode = "flat",
	geometry?: {
		extrusionOrigin?: CanvasObjectExtrusionOrigin;
		topPoints?: Point[] | null;
		basePoints?: Point[] | null;
	},
): string | undefined {
	if (renderMode === "flat") return undefined;
	const extrusionOrigin = geometry?.extrusionOrigin;
	const topPoints = geometry?.topPoints;
	const basePoints = geometry?.basePoints;
	return JSON.stringify({
		renderMode,
		...(extrusionOrigin === "top" ? {extrusionOrigin} : {}),
		...(topPoints && topPoints.length > 0 ? {topPoints: normalizePoints(topPoints)} : {}),
		...(basePoints && basePoints.length > 0 ? {basePoints: normalizePoints(basePoints)} : {}),
	});
}

export function getCanvasObjectRenderMode(
	shape: Pick<CanvasObject, "description" | "renderMetadataJson" | "type">,
): CanvasObjectRenderMode {
	if (shape.type === "Line") return "flat";
	const metadata = getCanvasObjectRenderMetadata(shape);
	return metadata?.renderMode === "extruded" ? "extruded" : "flat";
}

export function getCanvasObjectExtrusionOrigin(
	shape: Pick<CanvasObject, "description" | "renderMetadataJson">,
): CanvasObjectExtrusionOrigin {
	return getRenderMetadataExtrusionOrigin(getCanvasObjectRenderMetadata(shape));
}

export function getCanvasObjectExtrudedSecondaryPoints(
	shape: Pick<CanvasObject, "description" | "renderMetadataJson" | "type">,
	points: Point[],
): CanvasObjectExtrudedSecondaryPoints | null {
	if (
		shape.type === "Line" ||
		points.length < BLUEPRINT_POLYGON_MIN_POINTS ||
		getCanvasObjectRenderMode(shape) !== "extruded"
	) {
		return null;
	}

	const metadata = getCanvasObjectRenderMetadata(shape);
	const faces = getExtrudedPolygonFaces(points, metadata);
	const origin = getRenderMetadataExtrusionOrigin(metadata);

	if (origin === "top") {
		return {
			face: "base",
			points: faces.basePoints,
			explicit: Boolean(metadata?.basePoints && metadata.basePoints.length === points.length),
		};
	}

	return {
		face: "top",
		points: faces.topPoints,
		explicit: Boolean(metadata?.topPoints && metadata.topPoints.length === points.length),
	};
}

export function getCanvasObjectVertexHandles({
	shape,
	points,
	extrudedSecondaryPoints,
}: {
	shape: Pick<CanvasObject, "description" | "renderMetadataJson" | "type">;
	points: Point[];
	extrudedSecondaryPoints?: Point[] | null;
}): CanvasObjectVertexHandle[] {
	if (getCanvasObjectRenderMode(shape) !== "extruded") {
		return points.map((point, index) => ({
			kind: "base" as const,
			index,
			point,
		}));
	}

	const metadata = getCanvasObjectRenderMetadata(shape);
	const origin = getRenderMetadataExtrusionOrigin(metadata);
	const faces = getExtrudedPolygonFaces(points, {
		...metadata,
		...(extrudedSecondaryPoints && extrudedSecondaryPoints.length === points.length
			? origin === "top"
				? {basePoints: extrudedSecondaryPoints}
				: {topPoints: extrudedSecondaryPoints}
			: {}),
	});

	return [
		...faces.basePoints.map((point, index) => ({
			kind: "base" as const,
			index,
			point,
		})),
		...faces.topPoints.map((point, index) => ({
			kind: "top" as const,
			index,
			point,
		})),
	];
}

export function getCanvasObjectExtrusionHandle({
	shape,
	points,
	extrudedSecondaryPoints,
}: {
	shape: Pick<CanvasObject, "description" | "renderMetadataJson" | "type">;
	points: Point[];
	extrudedSecondaryPoints?: Point[] | null;
}): CanvasObjectExtrusionHandle | null {
	if (
		shape.type === "Line" ||
		points.length < BLUEPRINT_POLYGON_MIN_POINTS ||
		getCanvasObjectRenderMode(shape) !== "extruded"
	) {
		return null;
	}

	const metadata = getCanvasObjectRenderMetadata(shape);
	const origin = getRenderMetadataExtrusionOrigin(metadata);
	const faces = getExtrudedPolygonFaces(points, {
		...metadata,
		...(extrudedSecondaryPoints && extrudedSecondaryPoints.length === points.length
			? origin === "top"
				? {basePoints: extrudedSecondaryPoints}
				: {topPoints: extrudedSecondaryPoints}
			: {}),
	});
	const primaryPoints = origin === "top" ? faces.topPoints : faces.basePoints;
	const secondaryPoints = origin === "top" ? faces.basePoints : faces.topPoints;

	return {
		kind: "extrusion",
		face: origin === "top" ? "base" : "top",
		anchorPoint: getAveragePoint(primaryPoints),
		point: getAveragePoint(secondaryPoints),
	};
}

export function getCanvasObjectRenderMetadata(
	shape: Pick<CanvasObject, "description" | "renderMetadataJson">,
): CanvasObjectRenderMetadata | null {
	return (
		parseCanvasObjectRenderMetadataJson(shape.renderMetadataJson) ??
		parseCanvasObjectRenderDescriptionMetadata(shape.description)
	);
}

export function parseCanvasObjectRenderMetadataJson(value?: string): CanvasObjectRenderMetadata | null {
	if (!value) return null;

	try {
		const parsed = JSON.parse(value) as unknown;
		return normalizeCanvasObjectRenderMetadata(parsed);
	} catch {
		return null;
	}
}

export function getExtrudedPolygonFaces(
	points: Point[],
	metadata?: CanvasObjectRenderMetadata | null,
): {
	topPoints: Point[];
	basePoints: Point[];
	sideFaces: ExtrudedPolygonFace[];
} {
	if (points.length < 3) {
		return {
			topPoints: points,
			basePoints: points,
			sideFaces: [],
		};
	}

	const origin = getRenderMetadataExtrusionOrigin(metadata);
	const topPoints =
		origin === "top"
			? points
			: metadata?.topPoints?.length === points.length
				? normalizePoints(metadata.topPoints)
				: getDerivedExtrudedTopPoints(points);
	const basePoints =
		origin === "top"
			? metadata?.basePoints?.length === points.length
				? normalizePoints(metadata.basePoints)
				: getDerivedExtrudedBasePoints(points)
			: points;
	const sideFaces = basePoints
		.map((point, index) => {
			const nextIndex = (index + 1) % points.length;
			return {
				points: [point, basePoints[nextIndex], topPoints[nextIndex], topPoints[index]],
				shadeIndex: index,
			};
		})
		.sort((a, b) => getAverageY(a.points) - getAverageY(b.points));

	return {topPoints, basePoints, sideFaces};
}

export function shadeHexColor(color: string, amount: number): string {
	const normalized = normalizeHexColor(color);
	if (!normalized) return color;

	const target = amount >= 0 ? 255 : 0;
	const weight = Math.abs(clamp(amount, -1, 1));
	const channels = [normalized.slice(1, 3), normalized.slice(3, 5), normalized.slice(5, 7)].map((channel) => {
		const value = Number.parseInt(channel, 16);
		return Math.round(value + (target - value) * weight);
	});

	return `#${channels.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function constrainOrthogonalPoint(previous: Point, next: Point): Point {
	const dx = next.x - previous.x;
	const dy = next.y - previous.y;

	if (Math.abs(dx) >= Math.abs(dy)) {
		return {x: next.x, y: previous.y};
	}

	return {x: previous.x, y: next.y};
}

export function movePoints(points: Point[], delta: Point): Point[] {
	return points.map((point) => ({
		x: roundCoordinate(point.x + delta.x),
		y: roundCoordinate(point.y + delta.y),
	}));
}

export function rectanglePoints(start: Point, end: Point): Point[] {
	return [
		{x: start.x, y: start.y},
		{x: end.x, y: start.y},
		{x: end.x, y: end.y},
		{x: start.x, y: end.y},
	];
}

export function linePoints(start: Point, end: Point): Point[] {
	return [start, end];
}

export function getShapeImagePoints(shape: CanvasObject): Point[] {
	const parsed = parsePointsJson(shape.pointsJson);
	if (parsed.length > 0) return parsed;

	const start = {x: shape.x, y: shape.y};
	const end = {x: shape.x + shape.width, y: shape.y + shape.height};

	if (shape.type === "Line") return linePoints(start, end);
	return rectanglePoints(start, end);
}

export function getCanvasCursor(editMode: boolean, tool: ShapeTool, isPanning: boolean): string {
	if (!editMode) return "";
	if (isPanning) return "cursor-grabbing";
	if (tool === "select" || tool === "pan") return "cursor-grab";
	return "cursor-crosshair";
}

export function hasDrawableBounds(points: Point[]): boolean {
	const bounds = getPointBounds(points);
	return bounds.width >= BLUEPRINT_SHAPE_MIN_DRAW_SIZE || bounds.height >= BLUEPRINT_SHAPE_MIN_DRAW_SIZE;
}

export function getCenteredLabelFrame(points: Point[]): {
	x: number;
	y: number;
	width: number;
	height: number;
	fontSize: number;
} | null {
	if (points.length === 0) return null;
	const bounds = getPointBounds(points);
	const centerX = bounds.x + bounds.width / BLUEPRINT_LABEL_CENTER_DIVISOR;
	const centerY = bounds.y + bounds.height / BLUEPRINT_LABEL_CENTER_DIVISOR;
	const width = clamp(
		bounds.width * BLUEPRINT_LABEL_WIDTH_FACTOR,
		BLUEPRINT_LABEL_MIN_WIDTH,
		BLUEPRINT_LABEL_MAX_WIDTH,
	);
	const height = clamp(
		bounds.height * BLUEPRINT_LABEL_HEIGHT_FACTOR,
		BLUEPRINT_LABEL_MIN_HEIGHT,
		BLUEPRINT_LABEL_MAX_HEIGHT,
	);
	const fontSize =
		bounds.width < BLUEPRINT_LABEL_SMALL_SHAPE_WIDTH || bounds.height < BLUEPRINT_LABEL_SMALL_SHAPE_HEIGHT
			? BLUEPRINT_LABEL_SMALL_FONT_SIZE
			: BLUEPRINT_LABEL_DEFAULT_FONT_SIZE;

	return {
		x: roundCoordinate(centerX - width / BLUEPRINT_LABEL_CENTER_DIVISOR),
		y: roundCoordinate(centerY - height / BLUEPRINT_LABEL_CENTER_DIVISOR),
		width: roundCoordinate(width),
		height: roundCoordinate(height),
		fontSize,
	};
}

export function hasRenderableColor(value?: string): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

export function getCanvasObjectFallbackName({
	type,
	renderMode = "flat",
	sequenceNumber,
}: {
	type: CreateCanvasObject["type"];
	renderMode?: CanvasObjectRenderMode;
	sequenceNumber: number;
}): string {
	return renderMode === "extruded" ? `2.5D ${type} ${sequenceNumber}` : `${type} ${sequenceNumber}`;
}

export function getCanvasObjectAssignmentName({
	linkedLbsItemId,
	fallbackName,
	shapeLabelByLbsItemId,
}: {
	linkedLbsItemId: number | null;
	fallbackName: string;
	shapeLabelByLbsItemId: ReadonlyMap<number, string>;
}): string {
	if (linkedLbsItemId === null) return fallbackName;
	const linkedName = shapeLabelByLbsItemId.get(linkedLbsItemId)?.trim();
	return linkedName || fallbackName;
}

export function buildCreateCanvasObjectInput({
	name,
	type,
	points,
	style,
	linkedLbsItemId,
	zIndex,
	renderMode = "flat",
	extrusionOrigin,
	extrudedSecondaryPoints,
}: {
	name: string;
	type: CreateCanvasObject["type"];
	points: Point[];
	style: DraftStyle;
	linkedLbsItemId?: number | null;
	zIndex?: number;
	renderMode?: CanvasObjectRenderMode;
	extrusionOrigin?: CanvasObjectExtrusionOrigin;
	extrudedSecondaryPoints?: Point[];
}): CreateCanvasObject {
	const bounds = getPointBounds(points);
	const renderMetadataJson = buildCanvasObjectRenderMetadataJson(renderMode, {
		extrusionOrigin,
		...(extrusionOrigin === "top" ? {basePoints: extrudedSecondaryPoints} : {topPoints: extrudedSecondaryPoints}),
	});

	return {
		name,
		...(renderMetadataJson ? {renderMetadataJson} : {}),
		type,
		x: bounds.x,
		y: bounds.y,
		width: bounds.width,
		height: bounds.height,
		pointsJson: stringifyPoints(points),
		strokeColor: style.strokeEnabled ? style.strokeColor : null,
		fillColor: style.fillEnabled ? style.fillColor : null,
		opacity: style.opacity,
		rotation: BLUEPRINT_SHAPE_DEFAULT_ROTATION,
		zIndex: zIndex ?? BLUEPRINT_SHAPE_DEFAULT_Z_INDEX,
		isLocked: false,
		linkedLbsItemId,
	};
}

export function collectLbsLinkOptions(node: LbsNode, depth = BLUEPRINT_LINK_OPTION_MIN_VISIBLE_DEPTH): LbsLinkOption[] {
	return [
		{
			id: node.id,
			code: node.code,
			name: node.name,
			depth,
			...(node.objectType ? {objectType: node.objectType} : {}),
			...(node.hierarchyLevel !== undefined ? {hierarchyLevel: node.hierarchyLevel} : {}),
		},
		...node.children.flatMap((child) => collectLbsLinkOptions(child, depth + BLUEPRINT_LINK_OPTION_DEPTH_STEP)),
	];
}

export function collectLbsScopeItemIds(node: LbsNode): Set<number> {
	return new Set(collectLbsLinkOptions(node).map((option) => option.id));
}

export function isCanvasObjectVisibleInLbsScope({
	shape,
	lbsItemBlueprintAssignmentId,
	lbsScopeItemIds,
}: {
	shape: CanvasObject;
	lbsItemBlueprintAssignmentId: number;
	lbsScopeItemIds: ReadonlySet<number>;
}): boolean {
	const matchesAssignment =
		shape.lbsItemBlueprintAssignmentId === undefined ||
		shape.lbsItemBlueprintAssignmentId === lbsItemBlueprintAssignmentId;
	if (!matchesAssignment) return false;

	return shape.linkedLbsItemId === undefined || lbsScopeItemIds.has(shape.linkedLbsItemId);
}

function roundCoordinate(value: number): number {
	return Math.round(value * BLUEPRINT_COORDINATE_ROUNDING_FACTOR) / BLUEPRINT_COORDINATE_ROUNDING_FACTOR;
}

function normalizePoints(points: Point[]): Point[] {
	return points.map((point) => ({
		x: roundCoordinate(point.x),
		y: roundCoordinate(point.y),
	}));
}

function parseCanvasObjectRenderDescriptionMetadata(description?: string): CanvasObjectRenderMetadata | null {
	if (!description?.startsWith(CANVAS_OBJECT_RENDER_METADATA_PREFIX)) {
		return null;
	}

	return parseCanvasObjectRenderMetadataJson(description.slice(CANVAS_OBJECT_RENDER_METADATA_PREFIX.length));
}

function normalizeCanvasObjectRenderMetadata(value: unknown): CanvasObjectRenderMetadata | null {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value as Partial<CanvasObjectRenderMetadata>;
	const hasValidRenderMode =
		candidate.renderMode === undefined || candidate.renderMode === "flat" || candidate.renderMode === "extruded";
	if (!hasValidRenderMode) return null;
	const hasValidExtrusionOrigin =
		candidate.extrusionOrigin === undefined ||
		candidate.extrusionOrigin === "base" ||
		candidate.extrusionOrigin === "top";
	if (!hasValidExtrusionOrigin) return null;

	const topPoints = Array.isArray(candidate.topPoints) ? candidate.topPoints : null;
	const basePoints = Array.isArray(candidate.basePoints) ? candidate.basePoints : null;

	return {
		renderMode: candidate.renderMode,
		...(candidate.extrusionOrigin ? {extrusionOrigin: candidate.extrusionOrigin} : {}),
		...(topPoints && topPoints.every((point): point is Point => isPointLike(point))
			? {topPoints: normalizePoints(topPoints)}
			: {}),
		...(basePoints && basePoints.every((point): point is Point => isPointLike(point))
			? {basePoints: normalizePoints(basePoints)}
			: {}),
	};
}

function getRenderMetadataExtrusionOrigin(metadata?: CanvasObjectRenderMetadata | null): CanvasObjectExtrusionOrigin {
	return metadata?.extrusionOrigin === "top" ? "top" : "base";
}

function getDerivedExtrudedTopPoints(points: Point[]): Point[] {
	const offset = getExtrudedPolygonOffset(points);
	return points.map((point) => ({
		x: roundCoordinate(point.x + offset.x),
		y: roundCoordinate(point.y + offset.y),
	}));
}

function getDerivedExtrudedBasePoints(points: Point[]): Point[] {
	const offset = getExtrudedPolygonOffset(points);
	return points.map((point) => ({
		x: point.x,
		y: roundCoordinate(point.y - offset.y),
	}));
}

function getExtrudedPolygonOffset(points: Point[]): Point {
	const bounds = getPointBounds(points);
	const size = Math.max(bounds.width, bounds.height);
	const offsetY = clamp(
		size * BLUEPRINT_EXTRUDED_FACE_OFFSET_FACTOR,
		BLUEPRINT_EXTRUDED_FACE_MIN_OFFSET,
		BLUEPRINT_EXTRUDED_FACE_MAX_OFFSET,
	);

	return {
		x: roundCoordinate(offsetY * BLUEPRINT_EXTRUDED_FACE_OFFSET_X_FACTOR),
		y: roundCoordinate(-offsetY),
	};
}

function getAverageY(points: Point[]): number {
	return points.reduce((total, point) => total + point.y, 0) / points.length;
}

function getAveragePoint(points: Point[]): Point {
	return {
		x: roundCoordinate(points.reduce((total, point) => total + point.x, 0) / points.length),
		y: roundCoordinate(points.reduce((total, point) => total + point.y, 0) / points.length),
	};
}

function normalizeHexColor(color: string): string | null {
	const match = color.trim().match(HEX_COLOR_PATTERN);
	if (!match) return null;
	const value = match[1];
	if (value.length === 6) return `#${value.toLowerCase()}`;

	return `#${value
		.split("")
		.map((character) => `${character}${character}`)
		.join("")
		.toLowerCase()}`;
}

function isPointLike(value: unknown): value is Point {
	if (typeof value !== "object" || value === null) return false;
	const candidate = value as Partial<Point>;
	return typeof candidate.x === "number" && typeof candidate.y === "number";
}
