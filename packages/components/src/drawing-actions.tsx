import {
	Circle,
	Crosshair,
	Hexagon,
	type LucideIcon,
	MapPin,
	MousePointer2,
	PenLine,
	Redo2,
	Slash,
	Square,
	Undo2,
} from "lucide-react";
import * as React from "react";

import {Toolbar, ToolbarButton, type ToolbarMenuOption, ToolbarMenuButton, ToolbarSeparator} from "./toolbar";

export type DrawingToolId = "select" | "shape" | "line" | "pin";
export type ShapeKind = "rectangle" | "ellipse" | "polygon";
export type LineKind = "line" | "polyline";
export type PinKind = "pin" | "reference";

const SHAPE_SUBS: ToolbarMenuOption<ShapeKind>[] = [
	{id: "rectangle", label: "Rectangle", icon: <Square className="wwc:h-4 wwc:w-4" />, shortcut: "R"},
	{id: "ellipse", label: "Ellipse", icon: <Circle className="wwc:h-4 wwc:w-4" />, shortcut: "E"},
	{id: "polygon", label: "Polygon", icon: <Hexagon className="wwc:h-4 wwc:w-4" />, shortcut: "Y"},
];

const LINE_SUBS: ToolbarMenuOption<LineKind>[] = [
	{id: "line", label: "Line", icon: <Slash className="wwc:h-4 wwc:w-4" />, shortcut: "L"},
	{id: "polyline", label: "Polyline", icon: <PenLine className="wwc:h-4 wwc:w-4" />, shortcut: "Shift+L"},
];

const PIN_SUBS: ToolbarMenuOption<PinKind>[] = [
	{id: "pin", label: "Pin marker", icon: <MapPin className="wwc:h-4 wwc:w-4" />, shortcut: "P"},
	{id: "reference", label: "Reference point", icon: <Crosshair className="wwc:h-4 wwc:w-4" />, shortcut: "Shift+P"},
];

export interface DrawingActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Currently active drawing tool. */
	activeTool?: DrawingToolId;
	onActiveToolChange?: (tool: DrawingToolId) => void;
	/** Selected sub-tool for the Shape group. */
	shapeKind?: ShapeKind;
	onShapeKindChange?: (kind: ShapeKind) => void;
	/** Selected sub-tool for the Line group. */
	lineKind?: LineKind;
	onLineKindChange?: (kind: LineKind) => void;
	/** Selected sub-tool for the Pin group. */
	pinKind?: PinKind;
	onPinKindChange?: (kind: PinKind) => void;
	/** Undo/redo wiring. */
	onUndo?: () => void;
	onRedo?: () => void;
	canUndo?: boolean;
	canRedo?: boolean;
}

const DrawingActions = React.forwardRef<HTMLDivElement, DrawingActionsProps>(
	(
		{
			className,
			activeTool = "select",
			onActiveToolChange,
			shapeKind = "rectangle",
			onShapeKindChange,
			lineKind = "line",
			onLineKindChange,
			pinKind = "pin",
			onPinKindChange,
			onUndo,
			onRedo,
			canUndo = true,
			canRedo = true,
			...rest
		},
		ref,
	) => {
		return (
			<Toolbar ref={ref} aria-label="Drawing tools" className={className} {...rest}>
				<ToolButton
					active={activeTool === "select"}
					onClick={() => onActiveToolChange?.("select")}
					label="Select tool"
					shortcut="V"
					icon={MousePointer2}
				/>

				<ToolbarMenuButton
					active={activeTool === "shape"}
					value={shapeKind}
					options={SHAPE_SUBS}
					label="Shape tool"
					onSelect={(id) => {
						onShapeKindChange?.(id);
						onActiveToolChange?.("shape");
					}}
				/>

				<ToolbarMenuButton
					active={activeTool === "line"}
					value={lineKind}
					options={LINE_SUBS}
					label="Line tool"
					onSelect={(id) => {
						onLineKindChange?.(id);
						onActiveToolChange?.("line");
					}}
				/>

				<ToolbarMenuButton
					active={activeTool === "pin"}
					value={pinKind}
					options={PIN_SUBS}
					label="Pin / location tool"
					onSelect={(id) => {
						onPinKindChange?.(id);
						onActiveToolChange?.("pin");
					}}
				/>

				<ToolbarSeparator />

				<ToolbarButton icon label="Undo" onClick={onUndo} disabled={!canUndo}>
					<Undo2 className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
				<ToolbarButton icon label="Redo" onClick={onRedo} disabled={!canRedo}>
					<Redo2 className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
			</Toolbar>
		);
	},
);
DrawingActions.displayName = "DrawingActions";

function ToolButton({
	active,
	onClick,
	label,
	shortcut,
	icon: Icon,
}: {
	active: boolean;
	onClick?: () => void;
	label: string;
	shortcut?: string;
	icon: LucideIcon;
}) {
	return (
		<ToolbarButton icon active={active} onClick={onClick} label={label} shortcut={shortcut}>
			<Icon className="wwc:h-4 wwc:w-4" />
		</ToolbarButton>
	);
}

export {DrawingActions};
