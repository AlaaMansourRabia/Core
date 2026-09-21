import {useBlueprintCanvasEditorStore} from "./blueprintCanvasEditorStore";

export function useBlueprintCanvasEditorState() {
	const editMode = useBlueprintCanvasEditorStore((state) => state.editMode);
	const tool = useBlueprintCanvasEditorStore((state) => state.tool);
	const orthogonalMode = useBlueprintCanvasEditorStore((state) => state.orthogonalMode);
	const style = useBlueprintCanvasEditorStore((state) => state.style);
	const selectedId = useBlueprintCanvasEditorStore((state) => state.selectedId);
	const polygonDraft = useBlueprintCanvasEditorStore((state) => state.polygonDraft);
	const hoverImagePoint = useBlueprintCanvasEditorStore((state) => state.hoverImagePoint);
	const dragDraft = useBlueprintCanvasEditorStore((state) => state.dragDraft);
	const editingPoints = useBlueprintCanvasEditorStore((state) => state.editingPoints);
	const editingExtrudedSecondaryPoints = useBlueprintCanvasEditorStore((state) => state.editingExtrudedSecondaryPoints);
	const linkTargetId = useBlueprintCanvasEditorStore((state) => state.linkTargetId);
	const zoom = useBlueprintCanvasEditorStore((state) => state.zoom);
	const pan = useBlueprintCanvasEditorStore((state) => state.pan);
	const panStart = useBlueprintCanvasEditorStore((state) => state.panStart);
	const assignmentDialog = useBlueprintCanvasEditorStore((state) => state.assignmentDialog);
	const assignmentSearch = useBlueprintCanvasEditorStore((state) => state.assignmentSearch);
	const assignmentSelectionId = useBlueprintCanvasEditorStore((state) => state.assignmentSelectionId);
	const setEditMode = useBlueprintCanvasEditorStore((state) => state.setEditMode);
	const setTool = useBlueprintCanvasEditorStore((state) => state.setTool);
	const setOrthogonalMode = useBlueprintCanvasEditorStore((state) => state.setOrthogonalMode);
	const setStyle = useBlueprintCanvasEditorStore((state) => state.setStyle);
	const setSelectedId = useBlueprintCanvasEditorStore((state) => state.setSelectedId);
	const setPolygonDraft = useBlueprintCanvasEditorStore((state) => state.setPolygonDraft);
	const setHoverImagePoint = useBlueprintCanvasEditorStore((state) => state.setHoverImagePoint);
	const setDragDraft = useBlueprintCanvasEditorStore((state) => state.setDragDraft);
	const setEditingPoints = useBlueprintCanvasEditorStore((state) => state.setEditingPoints);
	const setEditingExtrudedSecondaryPoints = useBlueprintCanvasEditorStore(
		(state) => state.setEditingExtrudedSecondaryPoints,
	);
	const setLinkTargetId = useBlueprintCanvasEditorStore((state) => state.setLinkTargetId);
	const setZoom = useBlueprintCanvasEditorStore((state) => state.setZoom);
	const setPan = useBlueprintCanvasEditorStore((state) => state.setPan);
	const setPanStart = useBlueprintCanvasEditorStore((state) => state.setPanStart);
	const setAssignmentDialog = useBlueprintCanvasEditorStore((state) => state.setAssignmentDialog);
	const setAssignmentSearch = useBlueprintCanvasEditorStore((state) => state.setAssignmentSearch);
	const setAssignmentSelectionId = useBlueprintCanvasEditorStore((state) => state.setAssignmentSelectionId);
	const resetEditorForBlueprint = useBlueprintCanvasEditorStore((state) => state.resetForBlueprint);

	return {
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
	};
}
