import type Konva from "konva";
import type {RefObject} from "react";

import {ContextMenu, ContextMenuTrigger} from "@corensystem/core-ui/context-menu";
import {cn} from "@corensystem/core-utils";
import {Circle, Image as KonvaImage, Layer, Line, Rect, Stage} from "react-konva";

import {BlueprintCanvasContextMenu} from "./BlueprintCanvasContextMenu";
import type {CanvasObject} from "./canvas-object-types";
import {CanvasObjectShape} from "./CanvasObjectShape";
import {
	BLUEPRINT_CANVAS_DEFAULT_TOOL,
	BLUEPRINT_DRAFT_SHAPE_DASH,
	BLUEPRINT_EXTRUDED_VERTEX_HANDLE_RADIUS,
	BLUEPRINT_EXTRUSION_HANDLE_GUIDE_DASH,
	BLUEPRINT_EXTRUSION_HANDLE_RADIUS,
	BLUEPRINT_EXTRUSION_HANDLE_STROKE_WIDTH,
	BLUEPRINT_SHAPE_STROKE_WIDTH,
	BLUEPRINT_VERTEX_HANDLE_RADIUS,
	BLUEPRINT_VERTEX_HANDLE_STROKE_WIDTH,
} from "./constants";
import {DraftDragShape} from "./DraftDragShape";
import type {
	DraftStyle,
	DragDraft,
	ImageLayout,
	Point,
	CanvasObjectExtrusionHandle,
	CanvasObjectOrderAction,
	CanvasObjectVertexHandle,
	ShapeTool,
	Size,
} from "./types";
import {getShapeImagePoints, imagePointToStagePoint, stagePointToImagePoint} from "./utils";

type BlueprintCanvasSurfaceProps = {
	containerRef: RefObject<HTMLDivElement>;
	stageRef: RefObject<Konva.Stage>;
	containerSize: Size;
	canvasCursor: string;
	imageElement: HTMLImageElement | null;
	imageFailed: boolean;
	isLoading: boolean;
	layout: ImageLayout | null;
	editMode: boolean;
	tool: ShapeTool;
	shapes: CanvasObject[];
	selectedShape: CanvasObject | null;
	selectedId: number | null;
	editingPoints: Point[] | null;
	editingExtrudedSecondaryPoints: Point[] | null;
	linkTargetId: number | null;
	shapeLabelByLbsItemId: Map<number, string>;
	dragDraft: DragDraft | null;
	draftPolygonPoints: number[];
	selectedVertexHandles: CanvasObjectVertexHandle[];
	selectedExtrusionHandle: CanvasObjectExtrusionHandle | null;
	style: DraftStyle;
	alt: string;
	onStageMouseDown: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onStageMouseMove: (event: Konva.KonvaEventObject<MouseEvent>) => void;
	onStageMouseUp: () => void;
	onStageMouseLeave: () => void;
	onStageWheel: (event: Konva.KonvaEventObject<WheelEvent>) => void;
	onStageDoubleClick: () => void;
	onShapeSelect: (shapeId: number) => void;
	onShapeDragEnd: (event: Konva.KonvaEventObject<DragEvent>, shape: CanvasObject) => void;
	onVertexDragMove: (handle: CanvasObjectVertexHandle, point: Point) => void;
	onVertexDragEnd: () => void;
	onExtrusionHandleDragMove: (point: Point) => void;
	onExtrusionHandleDragEnd: () => void;
	onDuplicateSelected: () => void;
	onAssignSelected: () => void;
	onToggleLockSelected: () => void;
	onOrderSelected: (action: CanvasObjectOrderAction) => void;
	onDeleteSelected: () => void;
};

export function BlueprintCanvasSurface({
	containerRef,
	stageRef,
	containerSize,
	canvasCursor,
	imageElement,
	imageFailed,
	isLoading,
	layout,
	editMode,
	tool,
	shapes,
	selectedShape,
	selectedId,
	editingPoints,
	editingExtrudedSecondaryPoints,
	linkTargetId,
	shapeLabelByLbsItemId,
	dragDraft,
	draftPolygonPoints,
	selectedVertexHandles,
	selectedExtrusionHandle,
	style,
	alt,
	onStageMouseDown,
	onStageMouseMove,
	onStageMouseUp,
	onStageMouseLeave,
	onStageWheel,
	onStageDoubleClick,
	onShapeSelect,
	onShapeDragEnd,
	onVertexDragMove,
	onVertexDragEnd,
	onExtrusionHandleDragMove,
	onExtrusionHandleDragEnd,
	onDuplicateSelected,
	onAssignSelected,
	onToggleLockSelected,
	onOrderSelected,
	onDeleteSelected,
}: BlueprintCanvasSurfaceProps) {
	const draftDash = [...BLUEPRINT_DRAFT_SHAPE_DASH];
	const extrusionGuideDash = [...BLUEPRINT_EXTRUSION_HANDLE_GUIDE_DASH];
	const showSelectedHandles = Boolean(
		layout && editMode && tool === BLUEPRINT_CANVAS_DEFAULT_TOOL && selectedShape && !selectedShape.isLocked,
	);

	function renderExtrusionHandle() {
		if (!layout || !selectedShape || !selectedExtrusionHandle) return null;

		const anchorPoint = imagePointToStagePoint(selectedExtrusionHandle.anchorPoint, layout);
		const controlPoint = imagePointToStagePoint(selectedExtrusionHandle.point, layout);
		const handleColor = selectedShape.strokeColor ?? style.strokeColor;

		return (
			<>
				<Line
					points={[anchorPoint.x, anchorPoint.y, controlPoint.x, controlPoint.y]}
					stroke={handleColor}
					strokeWidth={BLUEPRINT_VERTEX_HANDLE_STROKE_WIDTH}
					dash={extrusionGuideDash}
					opacity={0.75}
					listening={false}
				/>
				<Circle
					x={controlPoint.x}
					y={controlPoint.y}
					radius={BLUEPRINT_EXTRUSION_HANDLE_RADIUS}
					fill={handleColor}
					stroke="white"
					strokeWidth={BLUEPRINT_EXTRUSION_HANDLE_STROKE_WIDTH}
					draggable
					onDragMove={(event) => {
						const next = stagePointToImagePoint({x: event.target.x(), y: event.target.y()}, layout);
						onExtrusionHandleDragMove(next);
					}}
					onDragEnd={onExtrusionHandleDragEnd}
				/>
				<Line
					points={[
						controlPoint.x,
						controlPoint.y - BLUEPRINT_EXTRUSION_HANDLE_RADIUS / 2,
						controlPoint.x,
						controlPoint.y + BLUEPRINT_EXTRUSION_HANDLE_RADIUS / 2,
					]}
					stroke="white"
					strokeWidth={BLUEPRINT_VERTEX_HANDLE_STROKE_WIDTH}
					lineCap="round"
					listening={false}
				/>
			</>
		);
	}

	function renderVertexHandle(handle: CanvasObjectVertexHandle) {
		if (!layout || !selectedShape) return null;

		const stagePoint = imagePointToStagePoint(handle.point, layout);
		const handleColor = selectedShape.strokeColor ?? style.strokeColor;
		const handleRadius =
			selectedExtrusionHandle !== null ? BLUEPRINT_EXTRUDED_VERTEX_HANDLE_RADIUS : BLUEPRINT_VERTEX_HANDLE_RADIUS;
		const useBaseHandle = selectedExtrusionHandle !== null && handle.kind === "base";

		if (useBaseHandle) {
			const size = handleRadius * 2;
			return (
				<Rect
					key={`${selectedShape.id}-${handle.kind}-${handle.index}`}
					x={stagePoint.x - handleRadius}
					y={stagePoint.y - handleRadius}
					width={size}
					height={size}
					cornerRadius={2}
					fill={handleColor}
					stroke="white"
					strokeWidth={BLUEPRINT_VERTEX_HANDLE_STROKE_WIDTH}
					draggable
					onDragMove={(event) => {
						const next = stagePointToImagePoint(
							{
								x: event.target.x() + handleRadius,
								y: event.target.y() + handleRadius,
							},
							layout,
						);
						onVertexDragMove(handle, next);
					}}
					onDragEnd={onVertexDragEnd}
				/>
			);
		}

		return (
			<Circle
				key={`${selectedShape.id}-${handle.kind}-${handle.index}`}
				x={stagePoint.x}
				y={stagePoint.y}
				radius={handleRadius}
				fill={handle.kind === "top" ? "white" : handleColor}
				stroke={handle.kind === "top" ? handleColor : "white"}
				strokeWidth={BLUEPRINT_VERTEX_HANDLE_STROKE_WIDTH}
				draggable
				onDragMove={(event) => {
					const next = stagePointToImagePoint({x: event.target.x(), y: event.target.y()}, layout);
					onVertexDragMove(handle, next);
				}}
				onDragEnd={onVertexDragEnd}
			/>
		);
	}

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<div ref={containerRef} className={cn("absolute inset-0", canvasCursor)}>
						{imageFailed ? (
							<div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
								Preview not available
							</div>
						) : null}
						{isLoading ? (
							<div className="absolute left-3 bottom-3 rounded-md border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
								Loading shapes
							</div>
						) : null}
						<Stage
							ref={stageRef}
							width={containerSize.width}
							height={containerSize.height}
							onMouseDown={onStageMouseDown}
							onMouseMove={onStageMouseMove}
							onMouseUp={onStageMouseUp}
							onMouseLeave={onStageMouseLeave}
							onWheel={onStageWheel}
							onDblClick={onStageDoubleClick}
						>
							<Layer>
								{imageElement && layout ? (
									<KonvaImage
										name="blueprint-image"
										image={imageElement}
										x={layout.x}
										y={layout.y}
										width={layout.width}
										height={layout.height}
										listening={editMode}
									/>
								) : null}
								{layout
									? shapes.map((shape) => (
											<CanvasObjectShape
												key={shape.id}
												shape={shape}
												layout={layout}
												editMode={editMode && tool === "select"}
												isSelected={selectedId === shape.id}
												isActiveLbs={linkTargetId === null || shape.linkedLbsItemId === linkTargetId}
												label={shape.linkedLbsItemId ? shapeLabelByLbsItemId.get(shape.linkedLbsItemId) : undefined}
												points={selectedId === shape.id && editingPoints ? editingPoints : getShapeImagePoints(shape)}
												extrudedSecondaryPoints={selectedId === shape.id ? editingExtrudedSecondaryPoints : undefined}
												onSelect={() => onShapeSelect(shape.id)}
												onDragEnd={(event) => onShapeDragEnd(event, shape)}
											/>
										))
									: null}
								{layout && dragDraft ? <DraftDragShape draft={dragDraft} layout={layout} style={style} /> : null}
								{layout && draftPolygonPoints.length > 0 ? (
									<Line
										points={draftPolygonPoints}
										stroke={style.strokeColor}
										strokeWidth={BLUEPRINT_SHAPE_STROKE_WIDTH}
										dash={draftDash}
										lineJoin="round"
										lineCap="round"
										closed={false}
										listening={false}
									/>
								) : null}
								{showSelectedHandles ? renderExtrusionHandle() : null}
								{showSelectedHandles ? selectedVertexHandles.map(renderVertexHandle) : null}
							</Layer>
						</Stage>
					</div>
				</ContextMenuTrigger>
				<BlueprintCanvasContextMenu
					selectedShape={selectedShape}
					onDuplicateSelected={onDuplicateSelected}
					onAssignSelected={onAssignSelected}
					onToggleLockSelected={onToggleLockSelected}
					onOrderSelected={onOrderSelected}
					onDeleteSelected={onDeleteSelected}
				/>
			</ContextMenu>
			<div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm">
				{alt}
			</div>
		</>
	);
}
