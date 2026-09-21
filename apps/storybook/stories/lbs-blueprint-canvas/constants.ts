import type {DraftStyle, Point, ShapeTool, Size} from "./types";

export type LevelColorConfig = {
	bg: string;
	dot: string;
	color: string;
};

export const LEVEL_COLORS: LevelColorConfig[] = [
	{
		bg: "bg-blue-500/5",
		dot: "bg-blue-500",
		color: "#3b82f6",
	},
	{
		bg: "bg-emerald-500/5",
		dot: "bg-emerald-500",
		color: "#10b981",
	},
	{
		bg: "bg-amber-500/5",
		dot: "bg-amber-500",
		color: "#f59e0b",
	},
	{
		bg: "bg-orange-500/5",
		dot: "bg-orange-500",
		color: "#f97316",
	},
	{
		bg: "bg-purple-500/5",
		dot: "bg-purple-500",
		color: "#a855f7",
	},
	{
		bg: "bg-pink-500/5",
		dot: "bg-pink-500",
		color: "#ec4899",
	},
	{
		bg: "bg-cyan-500/5",
		dot: "bg-cyan-500",
		color: "#06b6d4",
	},
];

export const STATUS_CONFIG = {
	assigned: {
		label: "Assigned",
		classes: "text-green-700 bg-green-500/10 border-green-500/30",
	},
	not_assigned: {
		label: "Not Assigned",
		classes: "text-muted-foreground bg-muted/50 border-border",
	},
} as const;

export const COVERAGE_CONFIG = {
	full: {
		label: "Full",
		classes: "text-blue-700 bg-blue-500/10 border-blue-500/30",
	},
	partial: {
		label: "Partial",
		classes: "text-amber-700 bg-amber-500/10 border-amber-500/30",
	},
	none: {
		label: "None",
		classes: "text-muted-foreground bg-muted/50 border-border",
	},
} as const;

export const BLUEPRINT_CANVAS_DEFAULT_TOOL: ShapeTool = "select";
export const BLUEPRINT_CANVAS_DEFAULT_ORTHOGONAL_MODE = true;
export const BLUEPRINT_CANVAS_DEFAULT_ZOOM = 1;
export const BLUEPRINT_CANVAS_EMPTY_SIZE: Size = {width: 0, height: 0};
export const BLUEPRINT_CANVAS_ORIGIN_POINT: Point = {x: 0, y: 0};
export const BLUEPRINT_EMPTY_BOUNDS = {x: 0, y: 0, width: 0, height: 0};
export const BLUEPRINT_COORDINATE_MIN = 0;
export const BLUEPRINT_COORDINATE_ROUNDING_FACTOR = 1000;

export const BLUEPRINT_CANVAS_DEFAULT_STYLE: DraftStyle = {
	strokeEnabled: true,
	strokeColor: "#16a34a",
	fillEnabled: true,
	fillColor: "#22c55e",
	opacity: 0.35,
};

export const BLUEPRINT_CANVAS_MIN_ZOOM = 0.6;
export const BLUEPRINT_CANVAS_MAX_ZOOM = 6;
export const BLUEPRINT_CANVAS_ZOOM_STEP = 1.2;
export const BLUEPRINT_IMAGE_LAYOUT_CENTER_DIVISOR = 2;
export const BLUEPRINT_LABEL_CENTER_DIVISOR = 2;
export const BLUEPRINT_LOCK_ICON_CENTER_DIVISOR = 2;
export const BLUEPRINT_VIEWPORT_CENTER_DIVISOR = 2;

export const BLUEPRINT_SHAPE_STROKE_WIDTH = 2;
export const BLUEPRINT_SHAPE_DEFAULT_ROTATION = 0;
export const BLUEPRINT_SHAPE_DEFAULT_Z_INDEX = 0;
export const BLUEPRINT_SHAPE_SELECTED_STROKE_WIDTH_INCREMENT = 1;
export const BLUEPRINT_SHAPE_HIT_STROKE_WIDTH = 16;
export const BLUEPRINT_SHAPE_MIN_DRAW_SIZE = 2;
export const BLUEPRINT_SHAPE_NAME_SEQUENCE_OFFSET = 1;
export const BLUEPRINT_SHAPE_DUPLICATE_OFFSET: Point = {x: 12, y: 12};
export const BLUEPRINT_SHAPE_MIN_Z_INDEX = 0;
export const BLUEPRINT_SHAPE_Z_INDEX_STEP = 1;
export const BLUEPRINT_EXTRUDED_FACE_OFFSET_FACTOR = 0.18;
export const BLUEPRINT_EXTRUDED_FACE_MIN_OFFSET = 8;
export const BLUEPRINT_EXTRUDED_FACE_MAX_OFFSET = 36;
export const BLUEPRINT_EXTRUDED_FACE_OFFSET_X_FACTOR = 0.55;
export const BLUEPRINT_EXTRUDED_FACE_TOP_LIGHTEN = 0.18;
export const BLUEPRINT_EXTRUDED_FACE_SIDE_DARKEN = 0.24;
export const BLUEPRINT_EXTRUDED_FACE_SIDE_DARKEN_STEP = 0.08;
export const BLUEPRINT_EXTRUDED_FACE_SIDE_OPACITY_FACTOR = 0.88;
export const BLUEPRINT_LOCKED_SHAPE_DASH = [8, 5] as const;
export const BLUEPRINT_DRAFT_SHAPE_DASH = [6, 4] as const;
export const BLUEPRINT_VERTEX_HANDLE_RADIUS = 5;
export const BLUEPRINT_VERTEX_HANDLE_STROKE_WIDTH = 2;
export const BLUEPRINT_EXTRUDED_VERTEX_HANDLE_RADIUS = 7;
export const BLUEPRINT_EXTRUSION_HANDLE_RADIUS = 8;
export const BLUEPRINT_EXTRUSION_HANDLE_STROKE_WIDTH = 2.5;
export const BLUEPRINT_EXTRUSION_HANDLE_GUIDE_DASH = [5, 4] as const;
export const BLUEPRINT_POLYGON_CLOSE_DISTANCE = 10;
export const BLUEPRINT_POLYGON_MIN_POINTS = 3;

export const BLUEPRINT_INACTIVE_SHAPE_MIN_OPACITY = 0.12;
export const BLUEPRINT_INACTIVE_SHAPE_OPACITY_FACTOR = 0.45;
export const BLUEPRINT_ACTIVE_LABEL_OPACITY = 0.95;
export const BLUEPRINT_INACTIVE_LABEL_OPACITY = 0.45;
export const BLUEPRINT_LABEL_BACKGROUND_CORNER_RADIUS = 3;
export const BLUEPRINT_LABEL_BACKGROUND_FILL = "#ffffff";
export const BLUEPRINT_LABEL_BACKGROUND_OPACITY = 0.92;
export const BLUEPRINT_LABEL_BACKGROUND_PADDING_X = 4;
export const BLUEPRINT_LABEL_BACKGROUND_PADDING_Y = 2;
export const BLUEPRINT_LABEL_TEXT_COLOR = "#111827";
export const BLUEPRINT_LABEL_SHADOW_COLOR = "#ffffff";
export const BLUEPRINT_LABEL_SHADOW_BLUR = 4;
export const BLUEPRINT_LABEL_SHADOW_OPACITY = 0.9;
export const BLUEPRINT_LABEL_SHADOW_OFFSET = 0;
export const BLUEPRINT_LABEL_LINE_HEIGHT = 1.1;
export const BLUEPRINT_LABEL_SMALL_FONT_SIZE = 11;
export const BLUEPRINT_LABEL_DEFAULT_FONT_SIZE = 14;
export const BLUEPRINT_LABEL_SMALL_SHAPE_WIDTH = 120;
export const BLUEPRINT_LABEL_SMALL_SHAPE_HEIGHT = 48;
export const BLUEPRINT_LABEL_MIN_WIDTH = 72;
export const BLUEPRINT_LABEL_MAX_WIDTH = 220;
export const BLUEPRINT_LABEL_MIN_HEIGHT = 22;
export const BLUEPRINT_LABEL_MAX_HEIGHT = 72;
export const BLUEPRINT_LABEL_WIDTH_FACTOR = 0.82;
export const BLUEPRINT_LABEL_HEIGHT_FACTOR = 0.42;

export const BLUEPRINT_LOCK_ICON_SIZE = 14;
export const BLUEPRINT_LOCK_ICON_GAP = 4;
export const BLUEPRINT_LOCK_ICON_FILL = BLUEPRINT_LABEL_TEXT_COLOR;
export const BLUEPRINT_LOCK_ICON_BODY = {
	x: 2,
	y: 6,
	width: 10,
	height: 7,
	cornerRadius: 1.5,
} as const;
export const BLUEPRINT_LOCK_ICON_SHACKLE_POINTS = [4, 6, 4, 4, 5, 2.5, 7, 2, 9, 2.5, 10, 4, 10, 6] as const;
export const BLUEPRINT_LOCK_ICON_SHACKLE_STROKE_WIDTH = 1.8;

export const BLUEPRINT_TOOLBAR_TOOLTIP_DELAY_MS = 150;
export const BLUEPRINT_TOOLBAR_ICON_SIZE = 15;
export const BLUEPRINT_MENU_ICON_SIZE = 14;
export const BLUEPRINT_PENCIL_ICON_SIZE = 14;
export const BLUEPRINT_COLOR_SWATCH_SIZE_CLASS = "h-5 w-5";
export const BLUEPRINT_TOOL_BUTTON_SIZE_CLASS = "h-8 w-8";
export const BLUEPRINT_OPACITY_SLIDER_MIN_PERCENT = 10;
export const BLUEPRINT_OPACITY_SLIDER_MAX_PERCENT = 100;
export const BLUEPRINT_OPACITY_SLIDER_STEP_PERCENT = 5;
export const BLUEPRINT_PERCENT_SCALE = 100;

export const BLUEPRINT_ASSIGNMENT_LIST_HEIGHT_CLASS = "h-72";
export const BLUEPRINT_ASSIGNMENT_EMPTY_HEIGHT_CLASS = "h-32";
export const BLUEPRINT_ASSIGNMENT_DEPTH_BASE_PADDING = 12;
export const BLUEPRINT_ASSIGNMENT_DEPTH_INDENT = 16;
export const BLUEPRINT_LINK_OPTION_MIN_VISIBLE_DEPTH = 0;
export const BLUEPRINT_LINK_OPTION_DEPTH_STEP = 1;
