import {create} from "zustand";

import {
	BLUEPRINT_CANVAS_DEFAULT_ORTHOGONAL_MODE,
	BLUEPRINT_CANVAS_DEFAULT_STYLE,
	BLUEPRINT_CANVAS_DEFAULT_TOOL,
	BLUEPRINT_CANVAS_DEFAULT_ZOOM,
	BLUEPRINT_CANVAS_ORIGIN_POINT,
} from "./constants";
import type {AssignmentDialogState, DraftStyle, DragDraft, Point, ShapeTool} from "./types";

type Updater<T> = T | ((current: T) => T);

type BlueprintCanvasEditorStateValues = {
	editMode: boolean;
	tool: ShapeTool;
	orthogonalMode: boolean;
	style: DraftStyle;
	selectedId: number | null;
	polygonDraft: Point[];
	hoverImagePoint: Point | null;
	dragDraft: DragDraft | null;
	editingPoints: Point[] | null;
	editingExtrudedSecondaryPoints: Point[] | null;
	linkTargetId: number | null;
	zoom: number;
	pan: Point;
	panStart: Point | null;
	assignmentDialog: AssignmentDialogState | null;
	assignmentSearch: string;
	assignmentSelectionId: number | null;
};

type BlueprintCanvasEditorStateActions = {
	setEditMode: (editMode: boolean) => void;
	setTool: (tool: ShapeTool) => void;
	setOrthogonalMode: (orthogonalMode: boolean) => void;
	setStyle: (style: Updater<DraftStyle>) => void;
	setSelectedId: (selectedId: number | null) => void;
	setPolygonDraft: (polygonDraft: Updater<Point[]>) => void;
	setHoverImagePoint: (hoverImagePoint: Point | null) => void;
	setDragDraft: (dragDraft: Updater<DragDraft | null>) => void;
	setEditingPoints: (editingPoints: Updater<Point[] | null>) => void;
	setEditingExtrudedSecondaryPoints: (editingExtrudedSecondaryPoints: Updater<Point[] | null>) => void;
	setLinkTargetId: (linkTargetId: number | null) => void;
	setZoom: (zoom: number) => void;
	setPan: (pan: Updater<Point>) => void;
	setPanStart: (panStart: Point | null) => void;
	setAssignmentDialog: (assignmentDialog: AssignmentDialogState | null) => void;
	setAssignmentSearch: (assignmentSearch: string) => void;
	setAssignmentSelectionId: (assignmentSelectionId: number | null) => void;
	resetForBlueprint: () => void;
};

export type BlueprintCanvasEditorState = BlueprintCanvasEditorStateValues & BlueprintCanvasEditorStateActions;

function createInitialState(): BlueprintCanvasEditorStateValues {
	return {
		editMode: false,
		tool: BLUEPRINT_CANVAS_DEFAULT_TOOL,
		orthogonalMode: BLUEPRINT_CANVAS_DEFAULT_ORTHOGONAL_MODE,
		style: {...BLUEPRINT_CANVAS_DEFAULT_STYLE},
		selectedId: null,
		polygonDraft: [],
		hoverImagePoint: null,
		dragDraft: null,
		editingPoints: null,
		editingExtrudedSecondaryPoints: null,
		linkTargetId: null,
		zoom: BLUEPRINT_CANVAS_DEFAULT_ZOOM,
		pan: {...BLUEPRINT_CANVAS_ORIGIN_POINT},
		panStart: null,
		assignmentDialog: null,
		assignmentSearch: "",
		assignmentSelectionId: null,
	};
}

function resolveUpdater<T>(updater: Updater<T>, current: T): T {
	return typeof updater === "function" ? (updater as (current: T) => T)(current) : updater;
}

export const useBlueprintCanvasEditorStore = create<BlueprintCanvasEditorState>((set) => ({
	...createInitialState(),

	setEditMode: (editMode) => set({editMode}),
	setTool: (tool) => set({tool}),
	setOrthogonalMode: (orthogonalMode) => set({orthogonalMode}),
	setStyle: (style) => set((state) => ({style: resolveUpdater(style, state.style)})),
	setSelectedId: (selectedId) => set({selectedId}),
	setPolygonDraft: (polygonDraft) =>
		set((state) => ({
			polygonDraft: resolveUpdater(polygonDraft, state.polygonDraft),
		})),
	setHoverImagePoint: (hoverImagePoint) => set({hoverImagePoint}),
	setDragDraft: (dragDraft) => set((state) => ({dragDraft: resolveUpdater(dragDraft, state.dragDraft)})),
	setEditingPoints: (editingPoints) =>
		set((state) => ({
			editingPoints: resolveUpdater(editingPoints, state.editingPoints),
		})),
	setEditingExtrudedSecondaryPoints: (editingExtrudedSecondaryPoints) =>
		set((state) => ({
			editingExtrudedSecondaryPoints: resolveUpdater(
				editingExtrudedSecondaryPoints,
				state.editingExtrudedSecondaryPoints,
			),
		})),
	setLinkTargetId: (linkTargetId) => set({linkTargetId}),
	setZoom: (zoom) => set({zoom}),
	setPan: (pan) =>
		set((state) => ({
			pan: resolveUpdater(pan, state.pan),
		})),
	setPanStart: (panStart) => set({panStart}),
	setAssignmentDialog: (assignmentDialog) => set({assignmentDialog}),
	setAssignmentSearch: (assignmentSearch) => set({assignmentSearch}),
	setAssignmentSelectionId: (assignmentSelectionId) => set({assignmentSelectionId}),
	resetForBlueprint: () => set(createInitialState()),
}));
