import type Konva from "konva";

import {Group, Line, Rect, Text} from "react-konva";

import type {CanvasObject} from "./canvas-object-types";
import {
	BLUEPRINT_ACTIVE_LABEL_OPACITY,
	BLUEPRINT_INACTIVE_LABEL_OPACITY,
	BLUEPRINT_INACTIVE_SHAPE_MIN_OPACITY,
	BLUEPRINT_INACTIVE_SHAPE_OPACITY_FACTOR,
	BLUEPRINT_EXTRUDED_FACE_SIDE_DARKEN,
	BLUEPRINT_EXTRUDED_FACE_SIDE_DARKEN_STEP,
	BLUEPRINT_EXTRUDED_FACE_SIDE_OPACITY_FACTOR,
	BLUEPRINT_EXTRUDED_FACE_TOP_LIGHTEN,
	BLUEPRINT_LABEL_BACKGROUND_CORNER_RADIUS,
	BLUEPRINT_LABEL_BACKGROUND_FILL,
	BLUEPRINT_LABEL_BACKGROUND_OPACITY,
	BLUEPRINT_LABEL_BACKGROUND_PADDING_X,
	BLUEPRINT_LABEL_BACKGROUND_PADDING_Y,
	BLUEPRINT_LABEL_LINE_HEIGHT,
	BLUEPRINT_LABEL_SHADOW_BLUR,
	BLUEPRINT_LABEL_SHADOW_COLOR,
	BLUEPRINT_LABEL_SHADOW_OFFSET,
	BLUEPRINT_LABEL_SHADOW_OPACITY,
	BLUEPRINT_LABEL_TEXT_COLOR,
	BLUEPRINT_LOCK_ICON_CENTER_DIVISOR,
	BLUEPRINT_LOCK_ICON_BODY,
	BLUEPRINT_LOCK_ICON_FILL,
	BLUEPRINT_LOCK_ICON_GAP,
	BLUEPRINT_LOCK_ICON_SHACKLE_POINTS,
	BLUEPRINT_LOCK_ICON_SHACKLE_STROKE_WIDTH,
	BLUEPRINT_LOCK_ICON_SIZE,
	BLUEPRINT_LOCKED_SHAPE_DASH,
	BLUEPRINT_SHAPE_HIT_STROKE_WIDTH,
	BLUEPRINT_SHAPE_SELECTED_STROKE_WIDTH_INCREMENT,
	BLUEPRINT_SHAPE_STROKE_WIDTH,
} from "./constants";
import type {ImageLayout, Point} from "./types";
import {
	flattenPoints,
	getCanvasObjectRenderMetadata,
	getCenteredLabelFrame,
	getExtrudedPolygonFaces,
	imagePointToStagePoint,
	shadeHexColor,
} from "./utils";

type CanvasObjectShapeProps = {
	shape: CanvasObject;
	layout: ImageLayout;
	editMode: boolean;
	interactive?: boolean;
	isSelected: boolean;
	isActiveLbs: boolean;
	label?: string;
	labelBackground?: boolean;
	points: Point[];
	extrudedSecondaryPoints?: Point[] | null;
	renderStyle?: CanvasObjectRenderStyle;
	onSelect: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
};

type CanvasObjectLabelOverlayProps = {
	shape: CanvasObject;
	layout: ImageLayout;
	label: string;
	labelBackground?: boolean;
	points: Point[];
	extrudedSecondaryPoints?: Point[] | null;
};

type CanvasObjectLabelProps = {
	label: string;
	points: Point[];
	labelBackground?: boolean;
	opacity?: number;
	showLockIndicator?: boolean;
	listening?: boolean;
};

export type CanvasObjectRenderStyle = {
	fillColor?: string;
	strokeColor?: string;
	opacity?: number;
};

export function CanvasObjectLabelOverlay({
	shape,
	layout,
	label,
	labelBackground = false,
	points,
	extrudedSecondaryPoints,
}: CanvasObjectLabelOverlayProps) {
	return (
		<CanvasObjectLabel
			label={label}
			points={getCanvasObjectLabelStagePoints({
				shape,
				layout,
				points,
				extrudedSecondaryPoints,
			})}
			labelBackground={labelBackground}
			listening={false}
		/>
	);
}

export function CanvasObjectShape({
	shape,
	layout,
	editMode,
	interactive = false,
	isSelected,
	isActiveLbs,
	label,
	labelBackground = false,
	points,
	extrudedSecondaryPoints,
	renderStyle,
	onSelect,
	onMouseEnter,
	onMouseLeave,
	onDragEnd,
}: CanvasObjectShapeProps) {
	const stagePoints = points.map((point) => imagePointToStagePoint(point, layout));
	const closed = shape.type !== "Line";
	const renderMetadata = closed ? getCanvasObjectRenderMetadata(shape) : null;
	const secondaryFaceKey = renderMetadata?.extrusionOrigin === "top" ? "basePoints" : "topPoints";
	const isExtruded = closed && stagePoints.length >= 3 && renderMetadata?.renderMode === "extruded";
	const extrudedImageFaces = isExtruded
		? getExtrudedPolygonFaces(points, {
				...renderMetadata,
				...(extrudedSecondaryPoints ? {[secondaryFaceKey]: extrudedSecondaryPoints} : {}),
			})
		: null;
	const extrudedFaces = extrudedImageFaces
		? {
				topPoints: extrudedImageFaces.topPoints.map((point) => imagePointToStagePoint(point, layout)),
				sideFaces: extrudedImageFaces.sideFaces.map((face) => ({
					...face,
					points: face.points.map((point) => imagePointToStagePoint(point, layout)),
				})),
			}
		: null;
	const labelPoints = extrudedFaces?.topPoints ?? stagePoints;
	const strokeWidth = isSelected
		? BLUEPRINT_SHAPE_STROKE_WIDTH + BLUEPRINT_SHAPE_SELECTED_STROKE_WIDTH_INCREMENT
		: BLUEPRINT_SHAPE_STROKE_WIDTH;
	const fillColor = renderStyle?.fillColor ?? shape.fillColor;
	const strokeColor = renderStyle?.strokeColor ?? shape.strokeColor ?? fillColor;
	const baseFillColor = fillColor ?? strokeColor;
	const topFillColor = baseFillColor ? shadeHexColor(baseFillColor, BLUEPRINT_EXTRUDED_FACE_TOP_LIGHTEN) : undefined;
	const opacity =
		renderStyle?.opacity ??
		(isActiveLbs || shape.linkedLbsItemId == null
			? shape.opacity
			: Math.max(BLUEPRINT_INACTIVE_SHAPE_MIN_OPACITY, shape.opacity * BLUEPRINT_INACTIVE_SHAPE_OPACITY_FACTOR));
	const labelFrame = label ? getCenteredLabelFrame(labelPoints) : null;
	const labelOpacity =
		isActiveLbs || shape.linkedLbsItemId == null ? BLUEPRINT_ACTIVE_LABEL_OPACITY : BLUEPRINT_INACTIVE_LABEL_OPACITY;
	const showLockIndicator = editMode && shape.isLocked;
	const lockedDash = [...BLUEPRINT_LOCKED_SHAPE_DASH];

	return (
		<Group
			id={`canvas-object-${shape.id}`}
			draggable={editMode && !shape.isLocked}
			listening={editMode || interactive}
			onClick={onSelect}
			onTap={onSelect}
			onContextMenu={onSelect}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onDragEnd={onDragEnd}
		>
			{extrudedFaces ? (
				<>
					{extrudedFaces.sideFaces.map((face) => (
						<Line
							key={`side-${face.shadeIndex}`}
							points={flattenPoints(face.points)}
							closed
							fill={
								baseFillColor
									? shadeHexColor(
											baseFillColor,
											-(
												BLUEPRINT_EXTRUDED_FACE_SIDE_DARKEN +
												(face.shadeIndex % 2) * BLUEPRINT_EXTRUDED_FACE_SIDE_DARKEN_STEP
											),
										)
									: undefined
							}
							stroke={strokeColor}
							strokeWidth={strokeWidth}
							opacity={opacity * BLUEPRINT_EXTRUDED_FACE_SIDE_OPACITY_FACTOR}
							lineJoin="round"
							lineCap="round"
							dash={showLockIndicator ? lockedDash : undefined}
							shadowForStrokeEnabled={false}
							perfectDrawEnabled={false}
							hitStrokeWidth={BLUEPRINT_SHAPE_HIT_STROKE_WIDTH}
						/>
					))}
					<Line
						points={flattenPoints(extrudedFaces.topPoints)}
						closed
						fill={topFillColor}
						stroke={strokeColor}
						strokeWidth={strokeWidth}
						opacity={opacity}
						lineJoin="round"
						lineCap="round"
						dash={showLockIndicator ? lockedDash : undefined}
						shadowForStrokeEnabled={false}
						perfectDrawEnabled={false}
						hitStrokeWidth={BLUEPRINT_SHAPE_HIT_STROKE_WIDTH}
					/>
				</>
			) : (
				<Line
					points={flattenPoints(stagePoints)}
					closed={closed}
					fill={closed ? fillColor : undefined}
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					opacity={opacity}
					lineJoin="round"
					lineCap="round"
					dash={showLockIndicator ? lockedDash : undefined}
					shadowForStrokeEnabled={false}
					perfectDrawEnabled={false}
					hitStrokeWidth={BLUEPRINT_SHAPE_HIT_STROKE_WIDTH}
				/>
			)}
			{label && labelFrame ? (
				<CanvasObjectLabel
					label={label}
					points={labelPoints}
					labelBackground={labelBackground}
					opacity={labelOpacity}
					showLockIndicator={showLockIndicator}
				/>
			) : null}
		</Group>
	);
}

function CanvasObjectLabel({
	label,
	points,
	labelBackground = false,
	opacity = BLUEPRINT_ACTIVE_LABEL_OPACITY,
	showLockIndicator = false,
	listening = true,
}: CanvasObjectLabelProps) {
	const labelFrame = getCenteredLabelFrame(points);
	if (!labelFrame) return null;

	const lockIconX = labelFrame.x + labelFrame.width + BLUEPRINT_LOCK_ICON_GAP;
	const lockIconY =
		labelFrame.y +
		labelFrame.height / BLUEPRINT_LOCK_ICON_CENTER_DIVISOR -
		BLUEPRINT_LOCK_ICON_SIZE / BLUEPRINT_LOCK_ICON_CENTER_DIVISOR;

	return (
		<Group listening={listening}>
			{labelBackground ? (
				<Rect
					x={labelFrame.x - BLUEPRINT_LABEL_BACKGROUND_PADDING_X}
					y={labelFrame.y - BLUEPRINT_LABEL_BACKGROUND_PADDING_Y}
					width={labelFrame.width + BLUEPRINT_LABEL_BACKGROUND_PADDING_X * 2}
					height={labelFrame.height + BLUEPRINT_LABEL_BACKGROUND_PADDING_Y * 2}
					cornerRadius={BLUEPRINT_LABEL_BACKGROUND_CORNER_RADIUS}
					fill={BLUEPRINT_LABEL_BACKGROUND_FILL}
					opacity={BLUEPRINT_LABEL_BACKGROUND_OPACITY}
					listening={false}
				/>
			) : null}
			<Text
				text={showLockIndicator ? `${label}  ` : label}
				x={labelFrame.x}
				y={labelFrame.y}
				width={labelFrame.width}
				height={labelFrame.height}
				align="center"
				verticalAlign="middle"
				wrap="word"
				ellipsis
				fontSize={labelFrame.fontSize}
				fontStyle="bold"
				lineHeight={BLUEPRINT_LABEL_LINE_HEIGHT}
				fill={BLUEPRINT_LABEL_TEXT_COLOR}
				opacity={opacity}
				shadowColor={BLUEPRINT_LABEL_SHADOW_COLOR}
				shadowBlur={BLUEPRINT_LABEL_SHADOW_BLUR}
				shadowOpacity={BLUEPRINT_LABEL_SHADOW_OPACITY}
				shadowOffsetX={BLUEPRINT_LABEL_SHADOW_OFFSET}
				shadowOffsetY={BLUEPRINT_LABEL_SHADOW_OFFSET}
			/>
			{showLockIndicator ? (
				<Group x={lockIconX} y={lockIconY} opacity={opacity} listening={false}>
					<Rect
						x={BLUEPRINT_LOCK_ICON_BODY.x}
						y={BLUEPRINT_LOCK_ICON_BODY.y}
						width={BLUEPRINT_LOCK_ICON_BODY.width}
						height={BLUEPRINT_LOCK_ICON_BODY.height}
						cornerRadius={BLUEPRINT_LOCK_ICON_BODY.cornerRadius}
						fill={BLUEPRINT_LOCK_ICON_FILL}
					/>
					<Line
						points={[...BLUEPRINT_LOCK_ICON_SHACKLE_POINTS]}
						stroke={BLUEPRINT_LOCK_ICON_FILL}
						strokeWidth={BLUEPRINT_LOCK_ICON_SHACKLE_STROKE_WIDTH}
						lineCap="round"
						lineJoin="round"
						closed={false}
					/>
				</Group>
			) : null}
		</Group>
	);
}

function getCanvasObjectLabelStagePoints({
	shape,
	layout,
	points,
	extrudedSecondaryPoints,
}: {
	shape: CanvasObject;
	layout: ImageLayout;
	points: Point[];
	extrudedSecondaryPoints?: Point[] | null;
}): Point[] {
	const stagePoints = points.map((point) => imagePointToStagePoint(point, layout));
	const closed = shape.type !== "Line";
	const renderMetadata = closed ? getCanvasObjectRenderMetadata(shape) : null;
	const secondaryFaceKey = renderMetadata?.extrusionOrigin === "top" ? "basePoints" : "topPoints";
	const isExtruded = closed && stagePoints.length >= 3 && renderMetadata?.renderMode === "extruded";
	const extrudedImageFaces = isExtruded
		? getExtrudedPolygonFaces(points, {
				...renderMetadata,
				...(extrudedSecondaryPoints ? {[secondaryFaceKey]: extrudedSecondaryPoints} : {}),
			})
		: null;

	return extrudedImageFaces
		? extrudedImageFaces.topPoints.map((point) => imagePointToStagePoint(point, layout))
		: stagePoints;
}
