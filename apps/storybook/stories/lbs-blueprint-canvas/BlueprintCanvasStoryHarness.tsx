import type Konva from "konva";

import {cn} from "@core/core-utils";
import {Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {BlueprintCanvasErrorFallback} from "./BlueprintCanvasErrorFallback";
import {BlueprintCanvasSurface} from "./BlueprintCanvasSurface";
import {BlueprintCanvasToolbar} from "./BlueprintCanvasToolbar";
import {BlueprintViewportControls} from "./BlueprintViewportControls";
import type {CanvasObject, CreateCanvasObject, UpdateCanvasObject} from "./canvas-object-types";
import {CanvasObjectAssignmentDialog} from "./CanvasObjectAssignmentDialog";
import {
	BLUEPRINT_CANVAS_DEFAULT_STYLE,
	BLUEPRINT_CANVAS_DEFAULT_TOOL,
	BLUEPRINT_CANVAS_DEFAULT_ZOOM,
	BLUEPRINT_CANVAS_EMPTY_SIZE,
	BLUEPRINT_CANVAS_MAX_ZOOM,
	BLUEPRINT_CANVAS_MIN_ZOOM,
	BLUEPRINT_CANVAS_ORIGIN_POINT,
	BLUEPRINT_CANVAS_ZOOM_STEP,
	BLUEPRINT_POLYGON_CLOSE_DISTANCE,
	BLUEPRINT_POLYGON_MIN_POINTS,
	BLUEPRINT_SHAPE_DUPLICATE_OFFSET,
	BLUEPRINT_SHAPE_NAME_SEQUENCE_OFFSET,
	BLUEPRINT_VIEWPORT_CENTER_DIVISOR,
} from "./constants";
import type {LbsNode} from "./lbs-types";
import type {
	CanvasObjectExtrusionOrigin,
	CanvasObjectExtrusionHandle,
	CanvasObjectOrderAction,
	CanvasObjectRenderMode,
	CanvasObjectVertexHandle,
	DraftStyle,
	Point,
	ShapeKind,
	Size,
} from "./types";
import {useBlueprintCanvasEditorState} from "./useBlueprintCanvasEditorState";
import {
	buildCanvasObjectRenderMetadataJson,
	buildCreateCanvasObjectInput,
	collectLbsLinkOptions,
	collectLbsScopeItemIds,
	constrainOrthogonalPoint,
	flattenPoints,
	getCanvasObjectExtrusionHandle,
	getCanvasObjectExtrudedSecondaryPoints,
	getCanvasObjectExtrusionOrigin,
	getCanvasObjectAssignmentName,
	getCanvasObjectFallbackName,
	getCanvasObjectOrderZIndex,
	getCanvasCursor,
	getCanvasObjectRenderMetadata,
	getCanvasObjectRenderMode,
	getCanvasObjectVertexHandles,
	getContainedImageLayout,
	getPointBounds,
	getShapeImagePoints,
	hasRenderableColor,
	hasDrawableBounds,
	imagePointToStagePoint,
	isCanvasObjectVisibleInLbsScope,
	isStagePointInsideImage,
	linePoints,
	movePoints,
	rectanglePoints,
	stagePointToImagePoint,
	stringifyPoints,
} from "./utils";

// Debounce style edits so dragging the opacity slider on a selected shape
// doesn't fire an API update on every tick.
const STYLE_APPLY_DEBOUNCE_MS = 250;

// ── Storybook decoupling (§4) ─────────────────────────────────────────────────
// The production editor reads shapes from React Query and persists via mutations, and gates editing
// on a capture permission. Here shapes live in local `useState`, the four mutations are local
// setState one-liners, and `canEdit` is a story arg. Everything else (pointer math, pan/zoom,
// geometry, Konva rendering) is the real code, imported unchanged.

/** Trivial error boundary standing in for @sentry/react's, rendering the real fallback. */
class BlueprintErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
	state: {error: Error | null} = {error: null};
	static getDerivedStateFromError(error: Error) {
		return {error};
	}
	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("BlueprintCanvasStoryHarness error:", error, info);
	}
	reset = () => this.setState({error: null});
	render() {
		return this.state.error ? (
			<BlueprintCanvasErrorFallback error={this.state.error} resetError={this.reset} />
		) : (
			this.props.children
		);
	}
}

const getDefinedValue = <T,>(value: T | undefined, fallback: T): T => (value !== undefined ? value : fallback);

/** Mirrors `applyCanvasObjectUpdate` from src/mutations/useCanvasObjectMutations.ts, incl. clear* flags. */
function applyLocalUpdate(shape: CanvasObject, data: UpdateCanvasObject): CanvasObject {
	return {
		...shape,
		name: getDefinedValue(data.name, shape.name),
		description: data.clearDescription ? undefined : getDefinedValue(data.description, shape.description),
		type: getDefinedValue(data.type, shape.type),
		x: getDefinedValue(data.x, shape.x),
		y: getDefinedValue(data.y, shape.y),
		width: getDefinedValue(data.width, shape.width),
		height: getDefinedValue(data.height, shape.height),
		pointsJson: data.clearPointsJson ? undefined : getDefinedValue(data.pointsJson, shape.pointsJson),
		renderMetadataJson: data.clearRenderMetadataJson
			? undefined
			: getDefinedValue(data.renderMetadataJson, shape.renderMetadataJson),
		assignedActivities: getDefinedValue(data.assignedActivities, shape.assignedActivities),
		strokeColor: data.clearStrokeColor ? undefined : getDefinedValue(data.strokeColor, shape.strokeColor),
		fillColor: data.clearFillColor ? undefined : getDefinedValue(data.fillColor, shape.fillColor),
		zIndex: getDefinedValue(data.zIndex, shape.zIndex),
		rotation: getDefinedValue(data.rotation, shape.rotation),
		opacity: getDefinedValue(data.opacity, shape.opacity),
		isLocked: getDefinedValue(data.isLocked, shape.isLocked),
		lbsItemBlueprintAssignmentId: getDefinedValue(
			data.lbsItemBlueprintAssignmentId,
			shape.lbsItemBlueprintAssignmentId,
		),
		linkedLbsItemId: data.clearLinkedLbsItem ? undefined : getDefinedValue(data.linkedLbsItemId, shape.linkedLbsItemId),
	};
}

type BlueprintCanvasStoryHarnessProps = {
	downloadUrl: string;
	alt: string;
	/** Story arg — a "View mode (read-only)" story passes false. */
	canEdit?: boolean;
	/** Seed shapes for local state (mock fixtures). */
	initialShapes?: CanvasObject[];
	selectedNode: LbsNode;
	/** Called when the harness's upload affordance produces a new object URL. */
	onImageUpload?: (url: string) => void;
	// Inert mock ids — kept so object-construction code stays unchanged.
	projectId?: string;
	blueprintId?: number;
	lbsItemBlueprintAssignmentId?: number;
	isOpenSpaceConfigured?: boolean;
	onImportOpenSpace?: () => void;
	onSelectFromLibrary?: () => void;
	onUnlink?: () => void;
	className?: string;
};

const EMPTY_CANVAS_OBJECTS: CanvasObject[] = [];

export function BlueprintCanvasStoryHarness({
	projectId = "storybook-project",
	blueprintId = 1,
	lbsItemBlueprintAssignmentId = 1,
	downloadUrl,
	alt,
	canEdit: canEditProp = true,
	initialShapes,
	selectedNode,
	isOpenSpaceConfigured = false,
	onImportOpenSpace = () => {},
	onSelectFromLibrary = () => {},
	onUnlink = () => {},
	className,
}: BlueprintCanvasStoryHarnessProps) {
	const canEdit = canEditProp;
	const containerRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<Konva.Stage>(null);
	const [containerSize, setContainerSize] = useState<Size>({
		...BLUEPRINT_CANVAS_EMPTY_SIZE,
	});
	const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
	const [imageSize, setImageSize] = useState<Size>({
		...BLUEPRINT_CANVAS_EMPTY_SIZE,
	});
	const [imageFailed, setImageFailed] = useState(false);
	const {
		editMode,
		tool,
		orthogonalMode,
		style,
		selectedId,
		polygonDraft,
		hoverImagePoint,
		dragDraft,
		editingPoints,
		editingExtrudedSecondaryPoints,
		linkTargetId,
		zoom,
		pan,
		panStart,
		assignmentDialog,
		assignmentSearch,
		assignmentSelectionId,
		setEditMode,
		setTool,
		setOrthogonalMode,
		setStyle,
		setSelectedId,
		setPolygonDraft,
		setHoverImagePoint,
		setDragDraft,
		setEditingPoints,
		setEditingExtrudedSecondaryPoints,
		setLinkTargetId,
		setZoom,
		setPan,
		setPanStart,
		setAssignmentDialog,
		setAssignmentSearch,
		setAssignmentSelectionId,
		resetEditorForBlueprint,
	} = useBlueprintCanvasEditorState();

	// ── Shapes: local state instead of React Query (§4.1) ──────────────────────
	const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>(() => initialShapes ?? EMPTY_CANVAS_OBJECTS);
	const isLoading = false;

	// ── Mutations: local setState, same {mutate, isPending} shape so every call site is unchanged ──
	const createCanvasObject = useMemo(
		() => ({
			isPending: false,
			mutate: (input: CreateCanvasObject, opts?: {onSuccess?: (created: CanvasObject) => void}) => {
				setCanvasObjects((prev) => {
					const nextId = prev.reduce((max, s) => Math.max(max, s.id), 0) + 1;
					const created: CanvasObject = {
						id: nextId,
						projectId,
						blueprintId,
						name: input.name,
						type: input.type,
						x: input.x,
						y: input.y,
						width: input.width,
						height: input.height,
						pointsJson: input.pointsJson ?? undefined,
						renderMetadataJson: input.renderMetadataJson ?? undefined,
						assignedActivities: input.assignedActivities ?? undefined,
						strokeColor: input.strokeColor ?? undefined,
						fillColor: input.fillColor ?? undefined,
						zIndex: input.zIndex ?? prev.length,
						rotation: input.rotation ?? 0,
						opacity: input.opacity ?? 1,
						isLocked: input.isLocked ?? false,
						lbsItemBlueprintAssignmentId: input.lbsItemBlueprintAssignmentId ?? undefined,
						linkedLbsItemId: input.linkedLbsItemId ?? undefined,
						createdAt: new Date(),
						createdById: "storybook",
					};
					opts?.onSuccess?.(created);
					return [...prev, created];
				});
			},
		}),
		[projectId, blueprintId],
	);
	const updateCanvasObject = useMemo(
		() => ({
			isPending: false,
			mutate: ({id, data}: {id: number; data: UpdateCanvasObject}) =>
				setCanvasObjects((prev) => prev.map((s) => (s.id === id ? applyLocalUpdate(s, data) : s))),
		}),
		[],
	);
	const deleteCanvasObject = useMemo(
		() => ({
			isPending: false,
			mutate: (id: number) => setCanvasObjects((prev) => prev.filter((s) => s.id !== id)),
		}),
		[],
	);

	const lbsScopeItemIds = useMemo(() => collectLbsScopeItemIds(selectedNode), [selectedNode]);
	const {shapes, hiddenCanvasObjectIds} = useMemo(() => {
		const nextShapes: CanvasObject[] = [];
		const nextHiddenCanvasObjectIds: number[] = [];

		for (const shape of canvasObjects) {
			if (
				isCanvasObjectVisibleInLbsScope({
					shape,
					lbsItemBlueprintAssignmentId,
					lbsScopeItemIds,
				})
			) {
				nextShapes.push(shape);
			} else {
				nextHiddenCanvasObjectIds.push(shape.id);
			}
		}

		nextShapes.sort((a, b) => a.zIndex - b.zIndex || a.id - b.id);
		return {
			shapes: nextShapes,
			hiddenCanvasObjectIds: nextHiddenCanvasObjectIds,
		};
	}, [canvasObjects, lbsItemBlueprintAssignmentId, lbsScopeItemIds]);
	const hiddenCanvasObjectWarningKey = `${blueprintId}:${lbsItemBlueprintAssignmentId}:${hiddenCanvasObjectIds.join(",")}`;
	const previousHiddenCanvasObjectWarningKeyRef = useRef("");
	const selectedShape = useMemo(() => shapes.find((shape) => shape.id === selectedId) ?? null, [shapes, selectedId]);
	const linkOptions = useMemo(() => collectLbsLinkOptions(selectedNode), [selectedNode]);
	const baseLayout = useMemo(() => getContainedImageLayout(containerSize, imageSize), [containerSize, imageSize]);
	const layout = useMemo(() => {
		if (!baseLayout) return null;
		return {
			...baseLayout,
			x: baseLayout.x + pan.x,
			y: baseLayout.y + pan.y,
			width: baseLayout.width * zoom,
			height: baseLayout.height * zoom,
		};
	}, [baseLayout, pan.x, pan.y, zoom]);
	const filteredLinkOptions = useMemo(() => {
		const query = assignmentSearch.trim().toLowerCase();
		if (!query) return linkOptions;
		return linkOptions.filter((option) => `${option.code} ${option.name}`.toLowerCase().includes(query));
	}, [assignmentSearch, linkOptions]);
	const shapeLabelByLbsItemId = useMemo(
		() => new Map(linkOptions.map((option) => [option.id, option.name])),
		[linkOptions],
	);
	const canvasCursor = getCanvasCursor(editMode, tool, panStart !== null);
	const editorInteractionRef = useRef({selectedId, tool});
	editorInteractionRef.current = {selectedId, tool};

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		const observer = new ResizeObserver(([entry]) => {
			const box = entry?.contentRect;
			if (!box) return;
			setContainerSize({width: box.width, height: box.height});
		});

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		resetEditorForBlueprint();
	}, [blueprintId, lbsItemBlueprintAssignmentId, projectId, resetEditorForBlueprint]);

	useEffect(() => {
		if (!import.meta.env.DEV) return;
		if (hiddenCanvasObjectIds.length === 0) {
			previousHiddenCanvasObjectWarningKeyRef.current = "";
			return;
		}
		if (previousHiddenCanvasObjectWarningKeyRef.current === hiddenCanvasObjectWarningKey) {
			return;
		}

		previousHiddenCanvasObjectWarningKeyRef.current = hiddenCanvasObjectWarningKey;
		console.warn("[lbs] Ignored canvas objects outside the active blueprint assignment scope.", {
			blueprintId,
			lbsItemBlueprintAssignmentId,
			canvasObjectIds: hiddenCanvasObjectIds,
		});
	}, [blueprintId, hiddenCanvasObjectIds, hiddenCanvasObjectWarningKey, lbsItemBlueprintAssignmentId]);

	useEffect(() => {
		setImageElement(null);
		setImageFailed(false);
		setImageSize({...BLUEPRINT_CANVAS_EMPTY_SIZE});
		setZoom(BLUEPRINT_CANVAS_DEFAULT_ZOOM);
		setPan({...BLUEPRINT_CANVAS_ORIGIN_POINT});
		if (!downloadUrl) return;

		const image = new window.Image();
		image.onload = () => {
			setImageElement(image);
			setImageSize({
				width: image.naturalWidth,
				height: image.naturalHeight,
			});
		};
		image.onerror = () => setImageFailed(true);
		image.src = downloadUrl;

		return () => {
			image.onload = null;
			image.onerror = null;
		};
	}, [downloadUrl, setPan, setZoom]);

	useEffect(() => {
		if (canEdit) return;
		setEditMode(false);
		setTool(BLUEPRINT_CANVAS_DEFAULT_TOOL);
		setSelectedId(null);
		setEditingPoints(null);
		setEditingExtrudedSecondaryPoints(null);
		cancelDraft();
		closeAssignmentDialog();
	}, [canEdit, setEditMode, setEditingExtrudedSecondaryPoints, setEditingPoints, setSelectedId, setTool]);

	useEffect(() => {
		const hasOption = linkTargetId !== null && linkOptions.some((option) => option.id === linkTargetId);
		if (!hasOption) {
			setLinkTargetId(null);
		}
	}, [linkOptions, linkTargetId, setLinkTargetId]);

	useEffect(() => {
		if (!selectedShape) {
			setEditingPoints(null);
			setEditingExtrudedSecondaryPoints(null);
			setLinkTargetId(null);
			return;
		}
		const shapePoints = getShapeImagePoints(selectedShape);
		const secondaryPoints = getCanvasObjectExtrudedSecondaryPoints(selectedShape, shapePoints);
		setEditingPoints(shapePoints);
		setEditingExtrudedSecondaryPoints(secondaryPoints?.explicit ? secondaryPoints.points : null);
		setStyle({
			strokeEnabled: hasRenderableColor(selectedShape.strokeColor),
			strokeColor: selectedShape.strokeColor ?? BLUEPRINT_CANVAS_DEFAULT_STYLE.strokeColor,
			fillEnabled: hasRenderableColor(selectedShape.fillColor),
			fillColor: selectedShape.fillColor ?? BLUEPRINT_CANVAS_DEFAULT_STYLE.fillColor,
			opacity: selectedShape.opacity,
		});
		if (selectedShape.linkedLbsItemId && linkOptions.some((option) => option.id === selectedShape.linkedLbsItemId)) {
			setLinkTargetId(selectedShape.linkedLbsItemId);
		} else {
			setLinkTargetId(null);
		}
	}, [linkOptions, selectedShape, setEditingExtrudedSecondaryPoints, setEditingPoints, setLinkTargetId, setStyle]);

	function getPointerImagePoint(event?: Konva.KonvaEventObject<MouseEvent>): Point | null {
		if (!layout) return null;
		const stage = stageRef.current;
		const pointer = stage?.getPointerPosition();
		if (!pointer || !isStagePointInsideImage(pointer, layout)) return null;
		const imagePoint = stagePointToImagePoint(pointer, layout);
		if (event?.evt.shiftKey && polygonDraft.length > 0) {
			return constrainOrthogonalPoint(polygonDraft[polygonDraft.length - 1], imagePoint);
		}
		return imagePoint;
	}

	function handleStageMouseDown(event: Konva.KonvaEventObject<MouseEvent>) {
		if (!canEdit || !editMode || !layout) return;
		if (tool === "pan") {
			startPan();
			return;
		}
		const targetName = event.target.name();
		const isCanvasHit = event.target === event.target.getStage() || targetName === "blueprint-image";
		if (!isCanvasHit) return;

		const point = getPointerImagePoint(event);
		if (!point) {
			setSelectedId(null);
			return;
		}

		if (tool === "select") {
			setSelectedId(null);
			startPan();
			return;
		}

		if (tool === "polygon" || tool === "extruded-polygon") {
			setSelectedId(null);
			addPolygonPoint(point);
			return;
		}

		const draftType = tool === "rectangle" ? "Rectangle" : "Line";
		setSelectedId(null);
		setDragDraft({type: draftType, start: point, current: point});
	}

	function handleStageMouseMove(event: Konva.KonvaEventObject<MouseEvent>) {
		if (!canEdit || !editMode || !layout) return;
		if (panStart) {
			const pointer = getStagePointer();
			if (!pointer) return;
			setPan((prev) => ({
				x: prev.x + pointer.x - panStart.x,
				y: prev.y + pointer.y - panStart.y,
			}));
			setPanStart(pointer);
			return;
		}
		const rawPoint = getPointerImagePoint();
		const point =
			rawPoint && (orthogonalMode || event.evt.shiftKey)
				? getConstrainedDraftPoint(rawPoint, event.evt.shiftKey)
				: rawPoint;
		setHoverImagePoint(point);

		if (dragDraft && point) {
			const nextPoint =
				dragDraft.type === "Line" && (orthogonalMode || event.evt.shiftKey)
					? constrainOrthogonalPoint(dragDraft.start, point)
					: point;
			setDragDraft({...dragDraft, current: nextPoint});
		}
	}

	function handleStageMouseUp() {
		if (panStart) {
			setPanStart(null);
			return;
		}
		if (!dragDraft) return;
		const points =
			dragDraft.type === "Rectangle"
				? rectanglePoints(dragDraft.start, dragDraft.current)
				: linePoints(dragDraft.start, dragDraft.current);

		if (hasDrawableBounds(points)) {
			createShape(dragDraft.type, points);
		}

		setDragDraft(null);
	}

	function handleStageWheel(event: Konva.KonvaEventObject<WheelEvent>) {
		if (!baseLayout || !layout) return;
		event.evt.preventDefault();
		const pointer = getStagePointer();
		if (!pointer) return;
		const direction = event.evt.deltaY > 0 ? 1 / BLUEPRINT_CANVAS_ZOOM_STEP : BLUEPRINT_CANVAS_ZOOM_STEP;
		zoomToStagePoint(clampZoom(zoom * direction), pointer);
	}

	function addPolygonPoint(point: Point) {
		if (!canEdit) return;
		if (polygonDraft.length >= BLUEPRINT_POLYGON_MIN_POINTS && layout) {
			const first = imagePointToStagePoint(polygonDraft[0], layout);
			const current = imagePointToStagePoint(point, layout);
			const distance = Math.hypot(current.x - first.x, current.y - first.y);
			if (distance <= BLUEPRINT_POLYGON_CLOSE_DISTANCE) {
				finishPolygon();
				return;
			}
		}

		const nextPoint =
			polygonDraft.length > 0 && orthogonalMode
				? constrainOrthogonalPoint(polygonDraft[polygonDraft.length - 1], point)
				: point;
		setPolygonDraft((prev) => [...prev, nextPoint]);
	}

	function finishPolygon() {
		if (!canEdit) return;
		if (polygonDraft.length < BLUEPRINT_POLYGON_MIN_POINTS) return;
		createShape(
			"Polygon",
			polygonDraft,
			tool === "extruded-polygon" ? "extruded" : "flat",
			tool === "extruded-polygon" ? "top" : undefined,
		);
		setPolygonDraft([]);
		setHoverImagePoint(null);
	}

	function cancelDraft() {
		setPolygonDraft([]);
		setDragDraft(null);
		setHoverImagePoint(null);
	}

	function createShape(
		type: ShapeKind,
		points: Point[],
		renderMode: CanvasObjectRenderMode = "flat",
		extrusionOrigin?: CanvasObjectExtrusionOrigin,
	) {
		if (!canEdit) return;
		setAssignmentDialog({
			mode: "create",
			draft: {type, points, renderMode, extrusionOrigin},
		});
		setAssignmentSelectionId(null);
		setAssignmentSearch("");
	}

	function saveDraftShape(linkedLbsItemId: number | null) {
		if (!canEdit) return;
		if (!assignmentDialog || assignmentDialog.mode !== "create") return;
		const {type, points, renderMode = "flat", extrusionOrigin, extrudedSecondaryPoints} = assignmentDialog.draft;
		const fallbackName = getCanvasObjectFallbackName({
			type,
			renderMode,
			sequenceNumber: shapes.length + BLUEPRINT_SHAPE_NAME_SEQUENCE_OFFSET,
		});
		const name = getCanvasObjectAssignmentName({
			linkedLbsItemId,
			fallbackName,
			shapeLabelByLbsItemId,
		});
		createCanvasObject.mutate(
			buildCreateCanvasObjectInput({
				name,
				type,
				points,
				style,
				linkedLbsItemId,
				zIndex: shapes.length,
				renderMode,
				extrusionOrigin,
				extrudedSecondaryPoints,
			}),
			{
				onSuccess: (created) => {
					if (!created) return;
					if (
						editorInteractionRef.current.selectedId === null &&
						editorInteractionRef.current.tool === BLUEPRINT_CANVAS_DEFAULT_TOOL
					) {
						setSelectedId(created.id);
					}
				},
			},
		);
		setSelectedId(null);
		setTool(BLUEPRINT_CANVAS_DEFAULT_TOOL);
		setLinkTargetId(null);
		closeAssignmentDialog();
	}

	function saveSelectedShapeAssignment(linkedLbsItemId: number | null) {
		if (!canEdit) return;
		if (!assignmentDialog || assignmentDialog.mode !== "update") return;
		const selectedShapeIndex = shapes.findIndex((shape) => shape.id === assignmentDialog.shape.id);
		const fallbackSequenceNumber =
			(selectedShapeIndex >= 0 ? selectedShapeIndex : shapes.length) + BLUEPRINT_SHAPE_NAME_SEQUENCE_OFFSET;
		const fallbackName = getCanvasObjectFallbackName({
			type: assignmentDialog.shape.type,
			renderMode: getCanvasObjectRenderMode(assignmentDialog.shape),
			sequenceNumber: fallbackSequenceNumber,
		});
		updateCanvasObject.mutate({
			id: assignmentDialog.shape.id,
			data:
				linkedLbsItemId === null
					? {clearLinkedLbsItem: true, name: fallbackName}
					: {
							linkedLbsItemId,
							name: getCanvasObjectAssignmentName({
								linkedLbsItemId,
								fallbackName,
								shapeLabelByLbsItemId,
							}),
						},
		});
		setLinkTargetId(linkedLbsItemId);
		closeAssignmentDialog();
	}

	function handleSaveAssignment(linkedLbsItemId: number | null) {
		if (assignmentDialog?.mode === "create") {
			saveDraftShape(linkedLbsItemId);
			return;
		}
		saveSelectedShapeAssignment(linkedLbsItemId);
	}

	function closeAssignmentDialog() {
		setAssignmentDialog(null);
		setAssignmentSelectionId(null);
		setAssignmentSearch("");
	}

	function updateShapeGeometry(shape: CanvasObject, points: Point[], extrudedSecondaryPoints?: Point[] | null) {
		if (!canEdit) return;
		const bounds = getPointBounds(points);
		updateCanvasObject.mutate({
			id: shape.id,
			data: {
				x: bounds.x,
				y: bounds.y,
				width: bounds.width,
				height: bounds.height,
				pointsJson: stringifyPoints(points),
				...buildRenderMetadataUpdate(shape, points.length, extrudedSecondaryPoints),
			},
		});
	}

	function buildRenderMetadataUpdate(
		shape: CanvasObject,
		pointCount: number,
		extrudedSecondaryPoints?: Point[] | null,
	): {renderMetadataJson?: string} {
		const renderMetadata = getCanvasObjectRenderMetadata(shape);
		if (shape.type === "Line" || renderMetadata?.renderMode !== "extruded") {
			return {};
		}
		const extrusionOrigin = getCanvasObjectExtrusionOrigin(shape);

		if (extrudedSecondaryPoints && extrudedSecondaryPoints.length === pointCount) {
			return {
				renderMetadataJson: buildCanvasObjectRenderMetadataJson("extruded", {
					extrusionOrigin,
					...(extrusionOrigin === "top" ? {basePoints: extrudedSecondaryPoints} : {topPoints: extrudedSecondaryPoints}),
				}),
			};
		}

		if (renderMetadata.topPoints || renderMetadata.basePoints) {
			return {
				renderMetadataJson: buildCanvasObjectRenderMetadataJson("extruded", {
					extrusionOrigin,
				}),
			};
		}

		return {};
	}

	function handleShapeDragEnd(event: Konva.KonvaEventObject<DragEvent>, shape: CanvasObject) {
		if (!canEdit || !layout || shape.isLocked) return;
		const node = event.target;
		const delta = {
			x: (node.x() / layout.width) * layout.naturalWidth,
			y: (node.y() / layout.height) * layout.naturalHeight,
		};
		node.position({...BLUEPRINT_CANVAS_ORIGIN_POINT});
		const points = getShapeImagePoints(shape);
		const secondaryPoints = getCanvasObjectExtrudedSecondaryPoints(shape, points);
		updateShapeGeometry(
			shape,
			movePoints(points, delta),
			secondaryPoints?.explicit ? movePoints(secondaryPoints.points, delta) : undefined,
		);
	}

	function handleVertexDragMove(handle: CanvasObjectVertexHandle, point: Point) {
		const shape = selectedShape;
		if (!canEdit || !editingPoints || !shape || shape.isLocked) return;
		const primaryFace = getCanvasObjectExtrusionOrigin(shape) === "top" ? "top" : "base";
		if (handle.kind === primaryFace) {
			const previousPoint = editingPoints[handle.index];
			const delta = previousPoint
				? {
						x: point.x - previousPoint.x,
						y: point.y - previousPoint.y,
					}
				: null;
			setEditingPoints(editingPoints.map((existing, i) => (i === handle.index ? point : existing)));
			if (delta && editingExtrudedSecondaryPoints?.length === editingPoints.length) {
				setEditingExtrudedSecondaryPoints(
					editingExtrudedSecondaryPoints.map((existing, i) =>
						i === handle.index
							? {
									x: existing.x + delta.x,
									y: existing.y + delta.y,
								}
							: existing,
					),
				);
			}
			return;
		}

		const secondaryPoints =
			editingExtrudedSecondaryPoints ?? getCanvasObjectExtrudedSecondaryPoints(shape, editingPoints)?.points;
		if (!secondaryPoints) return;
		setEditingExtrudedSecondaryPoints(secondaryPoints.map((existing, i) => (i === handle.index ? point : existing)));
	}

	function handleVertexDragEnd() {
		if (!canEdit || !selectedShape || selectedShape.isLocked || !editingPoints) return;
		updateShapeGeometry(selectedShape, editingPoints, editingExtrudedSecondaryPoints);
	}

	function handleExtrusionHandleDragMove(point: Point) {
		const shape = selectedShape;
		if (!canEdit || !editingPoints || !shape || shape.isLocked) return;
		const secondaryPoints =
			editingExtrudedSecondaryPoints ?? getCanvasObjectExtrudedSecondaryPoints(shape, editingPoints)?.points;
		if (!secondaryPoints) return;

		const handle = getCanvasObjectExtrusionHandle({
			shape,
			points: editingPoints,
			extrudedSecondaryPoints: secondaryPoints,
		});
		if (!handle) return;

		setEditingExtrudedSecondaryPoints(
			movePoints(secondaryPoints, {
				x: point.x - handle.point.x,
				y: point.y - handle.point.y,
			}),
		);
	}

	// Live-apply style edits to the selected shape (debounced). Replaces the old
	// "Apply" button — changing fill/stroke/opacity while a shape is selected
	// updates it directly; with nothing selected it just seeds the draft style
	// for the next shape.
	const applyStyleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (applyStyleTimerRef.current) clearTimeout(applyStyleTimerRef.current);
		},
		[],
	);

	function handleStyleChange(next: DraftStyle) {
		setStyle(next);
		if (!canEdit || !selectedShape || selectedShape.isLocked) return;
		const shapeId = selectedShape.id;
		if (applyStyleTimerRef.current) clearTimeout(applyStyleTimerRef.current);
		applyStyleTimerRef.current = setTimeout(() => {
			updateCanvasObject.mutate({
				id: shapeId,
				data: {
					strokeColor: next.strokeEnabled ? next.strokeColor : undefined,
					fillColor: next.fillEnabled ? next.fillColor : undefined,
					clearStrokeColor: !next.strokeEnabled,
					clearFillColor: !next.fillEnabled,
					opacity: next.opacity,
				},
			});
		}, STYLE_APPLY_DEBOUNCE_MS);
	}

	function handleDuplicateSelected() {
		if (!canEdit || !selectedShape) return;
		const selectedPoints = getShapeImagePoints(selectedShape);
		const points = movePoints(selectedPoints, BLUEPRINT_SHAPE_DUPLICATE_OFFSET);
		const extrusionOrigin = getCanvasObjectExtrusionOrigin(selectedShape);
		const secondaryPoints = getCanvasObjectExtrudedSecondaryPoints(selectedShape, selectedPoints);
		setAssignmentDialog({
			mode: "create",
			draft: {
				type: selectedShape.type,
				points,
				renderMode: getCanvasObjectRenderMode(selectedShape),
				extrusionOrigin,
				...(secondaryPoints?.explicit
					? {
							extrudedSecondaryPoints: movePoints(secondaryPoints.points, BLUEPRINT_SHAPE_DUPLICATE_OFFSET),
						}
					: {}),
			},
		});
		setAssignmentSelectionId(isValidLinkTarget(selectedShape.linkedLbsItemId) ? selectedShape.linkedLbsItemId : null);
		setAssignmentSearch("");
	}

	function handleAssignSelected() {
		if (!canEdit || !selectedShape) return;
		setAssignmentDialog({mode: "update", shape: selectedShape});
		setAssignmentSelectionId(isValidLinkTarget(selectedShape.linkedLbsItemId) ? selectedShape.linkedLbsItemId : null);
		setAssignmentSearch("");
	}

	function handleToggleLockSelected() {
		if (!canEdit || !selectedShape) return;
		updateCanvasObject.mutate({
			id: selectedShape.id,
			data: {isLocked: !selectedShape.isLocked},
		});
	}

	function handleDeleteSelected() {
		if (!canEdit || !selectedShape) return;
		deleteCanvasObject.mutate(selectedShape.id);
		setSelectedId(null);
		setEditingPoints(null);
		setEditingExtrudedSecondaryPoints(null);
	}

	function handleOrderSelected(action: CanvasObjectOrderAction) {
		if (!canEdit || !selectedShape) return;
		updateCanvasObject.mutate({
			id: selectedShape.id,
			data: {
				zIndex: getCanvasObjectOrderZIndex(selectedShape, shapes, action),
			},
		});
	}

	// Delete / Backspace removes the selected (unlocked) shape while editing.
	// Latest state is read from a ref so the listener stays registered once.
	const deleteShortcutRef = useRef({
		canEdit,
		editMode,
		selectedShape,
		deleteSelected: handleDeleteSelected,
	});
	deleteShortcutRef.current = {
		canEdit,
		editMode,
		selectedShape,
		deleteSelected: handleDeleteSelected,
	};
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== "Delete" && event.key !== "Backspace") return;
			const {
				canEdit: canEditNow,
				editMode: editModeNow,
				selectedShape: shape,
				deleteSelected,
			} = deleteShortcutRef.current;
			if (!canEditNow || !editModeNow || !shape || shape.isLocked) return;
			const target = event.target as HTMLElement | null;
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) {
				return;
			}
			event.preventDefault();
			deleteSelected();
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const getConstrainedDraftPoint = useCallback(
		(point: Point, shiftKey: boolean): Point => {
			if (polygonDraft.length === 0 || (!orthogonalMode && !shiftKey)) return point;
			return constrainOrthogonalPoint(polygonDraft[polygonDraft.length - 1], point);
		},
		[orthogonalMode, polygonDraft],
	);

	function getStagePointer(): Point | null {
		return stageRef.current?.getPointerPosition() ?? null;
	}

	function startPan() {
		const pointer = getStagePointer();
		if (pointer) setPanStart(pointer);
	}

	function zoomToStagePoint(nextZoom: number, stagePoint: Point) {
		if (!baseLayout || !layout) return;
		const imagePoint = stagePointToImagePoint(stagePoint, layout);
		setZoom(nextZoom);
		setPan({
			x: stagePoint.x - baseLayout.x - (imagePoint.x / baseLayout.naturalWidth) * baseLayout.width * nextZoom,
			y: stagePoint.y - baseLayout.y - (imagePoint.y / baseLayout.naturalHeight) * baseLayout.height * nextZoom,
		});
	}

	function zoomBy(multiplier: number) {
		zoomToStagePoint(clampZoom(zoom * multiplier), {
			x: containerSize.width / BLUEPRINT_VIEWPORT_CENTER_DIVISOR,
			y: containerSize.height / BLUEPRINT_VIEWPORT_CENTER_DIVISOR,
		});
	}

	function resetViewport() {
		setZoom(BLUEPRINT_CANVAS_DEFAULT_ZOOM);
		setPan({...BLUEPRINT_CANVAS_ORIGIN_POINT});
		setPanStart(null);
	}

	function clampZoom(value: number): number {
		return Math.min(BLUEPRINT_CANVAS_MAX_ZOOM, Math.max(BLUEPRINT_CANVAS_MIN_ZOOM, value));
	}

	function isValidLinkTarget(id: number | undefined): id is number {
		return typeof id === "number" && linkOptions.some((option) => option.id === id);
	}

	const draftPolygonPoints = useMemo(() => {
		if (!layout || polygonDraft.length === 0) return [];
		const previewPoint =
			hoverImagePoint && polygonDraft.length > 0 ? getConstrainedDraftPoint(hoverImagePoint, false) : null;
		const points = previewPoint ? [...polygonDraft, previewPoint] : polygonDraft;
		return flattenPoints(points.map((point) => imagePointToStagePoint(point, layout)));
	}, [getConstrainedDraftPoint, hoverImagePoint, layout, polygonDraft]);

	const selectedVertexHandles = selectedShape
		? getCanvasObjectVertexHandles({
				shape: selectedShape,
				points: editingPoints ?? getShapeImagePoints(selectedShape),
				extrudedSecondaryPoints: editingExtrudedSecondaryPoints,
			})
		: [];
	const selectedExtrusionHandle: CanvasObjectExtrusionHandle | null = selectedShape
		? getCanvasObjectExtrusionHandle({
				shape: selectedShape,
				points: editingPoints ?? getShapeImagePoints(selectedShape),
				extrudedSecondaryPoints: editingExtrudedSecondaryPoints,
			})
		: null;

	return (
		<div className={cn("flex h-full min-h-0 flex-col bg-white", className)}>
			{canEdit ? (
				<BlueprintCanvasToolbar
					editMode={editMode}
					tool={tool}
					orthogonalMode={orthogonalMode}
					style={style}
					selectedShape={selectedShape}
					polygonDraftCount={polygonDraft.length}
					isSaving={createCanvasObject.isPending || updateCanvasObject.isPending || deleteCanvasObject.isPending}
					onEditModeChange={(value) => {
						setEditMode(value);
						if (!value) {
							setTool(BLUEPRINT_CANVAS_DEFAULT_TOOL);
							setSelectedId(null);
							setEditingPoints(null);
							setEditingExtrudedSecondaryPoints(null);
							cancelDraft();
						}
					}}
					onToolChange={(value) => {
						setTool(value);
						cancelDraft();
					}}
					onOrthogonalModeChange={setOrthogonalMode}
					onStyleChange={handleStyleChange}
					onAssignSelected={handleAssignSelected}
					onDuplicate={handleDuplicateSelected}
					onToggleLock={handleToggleLockSelected}
					onOrder={handleOrderSelected}
					onUnlink={onUnlink}
					onFinishPolygon={finishPolygon}
					onCancelDraft={cancelDraft}
					isOpenSpaceConfigured={isOpenSpaceConfigured}
					onImportOpenSpace={onImportOpenSpace}
					onSelectFromLibrary={onSelectFromLibrary}
				/>
			) : null}
			<div className="relative min-h-0 flex-1">
				<BlueprintViewportControls
					zoom={zoom}
					disabled={!baseLayout || !layout}
					onZoomIn={() => zoomBy(BLUEPRINT_CANVAS_ZOOM_STEP)}
					onZoomOut={() => zoomBy(1 / BLUEPRINT_CANVAS_ZOOM_STEP)}
					onReset={resetViewport}
				/>

				<BlueprintErrorBoundary>
					<BlueprintCanvasSurface
						containerRef={containerRef}
						stageRef={stageRef}
						containerSize={containerSize}
						canvasCursor={canvasCursor}
						imageElement={imageElement}
						imageFailed={imageFailed}
						isLoading={isLoading}
						layout={layout}
						editMode={canEdit && editMode}
						tool={tool}
						shapes={shapes}
						selectedShape={canEdit ? selectedShape : null}
						selectedId={selectedId}
						editingPoints={editingPoints}
						editingExtrudedSecondaryPoints={editingExtrudedSecondaryPoints}
						linkTargetId={linkTargetId}
						shapeLabelByLbsItemId={shapeLabelByLbsItemId}
						dragDraft={dragDraft}
						draftPolygonPoints={draftPolygonPoints}
						selectedVertexHandles={selectedVertexHandles}
						selectedExtrusionHandle={selectedExtrusionHandle}
						style={style}
						alt={alt}
						onStageMouseDown={handleStageMouseDown}
						onStageMouseMove={handleStageMouseMove}
						onStageMouseUp={handleStageMouseUp}
						onStageMouseLeave={() => setPanStart(null)}
						onStageWheel={handleStageWheel}
						onStageDoubleClick={canEdit ? finishPolygon : () => undefined}
						onShapeSelect={(shapeId) => {
							setSelectedId(shapeId);
							setTool(BLUEPRINT_CANVAS_DEFAULT_TOOL);
						}}
						onShapeDragEnd={handleShapeDragEnd}
						onVertexDragMove={handleVertexDragMove}
						onVertexDragEnd={handleVertexDragEnd}
						onExtrusionHandleDragMove={handleExtrusionHandleDragMove}
						onExtrusionHandleDragEnd={handleVertexDragEnd}
						onDuplicateSelected={handleDuplicateSelected}
						onAssignSelected={handleAssignSelected}
						onToggleLockSelected={handleToggleLockSelected}
						onOrderSelected={handleOrderSelected}
						onDeleteSelected={handleDeleteSelected}
					/>
				</BlueprintErrorBoundary>
			</div>
			{canEdit ? (
				<CanvasObjectAssignmentDialog
					open={assignmentDialog !== null}
					mode={assignmentDialog?.mode ?? "create"}
					options={filteredLinkOptions}
					search={assignmentSearch}
					selectedId={assignmentSelectionId}
					onOpenChange={(open) => {
						if (!open) closeAssignmentDialog();
					}}
					onSearchChange={setAssignmentSearch}
					onSelectionChange={setAssignmentSelectionId}
					onSave={handleSaveAssignment}
				/>
			) : null}
		</div>
	);
}
