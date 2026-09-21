import {cn} from "@wakecap/core-utils";
import {
	Circle,
	Hand,
	Lock,
	LockOpen,
	Minus,
	MousePointer2,
	PaintBucket,
	Pencil,
	PencilLine,
	Pentagon,
	Square,
	Unlink,
	Upload,
} from "lucide-react";
import * as React from "react";

import {Slider} from "./slider";
import {Toolbar, ToolbarButton, ToolbarSeparator} from "./toolbar";
import {ToolbarColorPicker} from "./toolbar-color-picker";
import {HoverTooltip, TooltipProvider} from "./tooltip";

/** The drawing tools in the tool group (one active at a time). */
export type DrawingTool = "select" | "pan" | "line" | "circle" | "rectangle" | "polygon";

interface ToolDef {
	id: DrawingTool;
	label: string;
	icon: React.ReactNode;
}

/** Selection / navigation tools. */
const SELECT_TOOLS: ToolDef[] = [
	{
		id: "select",
		label: "Select",
		icon: <MousePointer2 className="wwc:h-4 wwc:w-4" />,
	},
	{id: "pan", label: "Pan", icon: <Hand className="wwc:h-4 wwc:w-4" />},
];

/** Shape drawing tools. */
const SHAPE_TOOLS: ToolDef[] = [
	{
		id: "line",
		label: "Line",
		icon: <Minus className="wwc:h-4 wwc:w-4" />,
	},
	{
		id: "circle",
		label: "Circle",
		icon: <Circle className="wwc:h-4 wwc:w-4" />,
	},
	{id: "rectangle", label: "Rectangle", icon: <Square className="wwc:h-4 wwc:w-4" />},
	{
		id: "polygon",
		label: "Polygon",
		icon: <Pentagon className="wwc:h-4 wwc:w-4" />,
	},
];

export interface ObjectDrawingToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Canvas mode: `true` = Editing (draw/modify), `false` = Viewing (pan/zoom). */
	defaultEditing?: boolean;
	onEditingChange?: (editing: boolean) => void;
	/** The active drawing tool. */
	defaultTool?: DrawingTool;
	onToolChange?: (tool: DrawingTool) => void;
	/** Current fill color. */
	defaultFillColor?: string;
	onFillColorChange?: (color: string) => void;
	/** Current stroke color. */
	defaultStrokeColor?: string;
	onStrokeColorChange?: (color: string) => void;
	/** Object opacity, 0–100. */
	defaultOpacity?: number;
	onOpacityChange?: (opacity: number) => void;
	/** Snap-to-90° toggle. */
	defaultAngleSnap?: boolean;
	onAngleSnapChange?: (enabled: boolean) => void;
	/** Fires when the unlink button is pressed. */
	onUnlink?: () => void;
	/** Fires when the Import button is pressed. */
	onImport?: () => void;
}

/**
 * A single-line horizontal toolbar for a 2D canvas drawing tool, composed entirely from WakeCore
 * components: a mode pill and drawing-tool group (`ToolbarButton`), fill/stroke color pickers
 * (`ToolbarColorPicker`), an opacity `Slider`, a 90°-snap toggle, and unlink / import actions —
 * separated by `ToolbarSeparator`s. Renders bare (no border/background) so the host owns the chrome.
 */
const ObjectDrawingToolbar = React.forwardRef<HTMLDivElement, ObjectDrawingToolbarProps>(
	(
		{
			className,
			defaultEditing = true,
			onEditingChange,
			defaultTool = "select",
			onToolChange,
			defaultFillColor = "#2563EB",
			onFillColorChange,
			defaultStrokeColor = "#7C3AED",
			onStrokeColorChange,
			defaultOpacity = 80,
			onOpacityChange,
			defaultAngleSnap = false,
			onAngleSnapChange,
			onUnlink,
			onImport,
			...rest
		},
		ref,
	) => {
		const [editing, setEditing] = React.useState(defaultEditing);
		const [tool, setTool] = React.useState<DrawingTool>(defaultTool);
		const [fillColor, setFillColor] = React.useState(defaultFillColor);
		const [strokeColor, setStrokeColor] = React.useState(defaultStrokeColor);
		const [opacity, setOpacity] = React.useState(defaultOpacity);
		const [angleSnap, setAngleSnap] = React.useState(defaultAngleSnap);

		const renderTool = (t: ToolDef) => (
			<HoverTooltip key={t.id} content={t.label} side="bottom">
				<ToolbarButton
					icon
					label={t.label}
					active={tool === t.id}
					onClick={() => {
						setTool(t.id);
						onToolChange?.(t.id);
					}}
				>
					{t.icon}
				</ToolbarButton>
			</HoverTooltip>
		);

		return (
			<TooltipProvider delayDuration={200}>
				<Toolbar
					ref={ref}
					variant="bare"
					aria-label="Object drawing tools"
					className={cn("wwc:gap-1", className)}
					{...rest}
				>
					{/* 1 — Mode toggle */}
					<ToolbarButton
						variant={editing ? "default" : "outline"}
						aria-pressed={editing}
						className="wwc:gap-1.5 wwc:px-3"
						onClick={() => {
							const next = !editing;
							setEditing(next);
							onEditingChange?.(next);
						}}
					>
						<Pencil className="wwc:h-4 wwc:w-4" />
						<span className="wwc:text-sm wwc:font-medium">{editing ? "Editing" : "Edit"}</span>
					</ToolbarButton>

					{/* The tools only show in Editing mode; View mode collapses to just the Edit button. */}
					{editing && (
						<>
							<ToolbarSeparator />

							{/* 2a — Selection / navigation tools (each with a tooltip) */}
							{SELECT_TOOLS.map(renderTool)}

							<ToolbarSeparator />

							{/* 2b — Shape drawing tools */}
							{SHAPE_TOOLS.map(renderTool)}

							<ToolbarSeparator />

							{/* 3 — Fill & stroke color */}
							<ToolbarColorPicker
								label="Fill color"
								icon={<PaintBucket className="wwc:h-4 wwc:w-4" />}
								value={fillColor}
								onValueChange={(c) => {
									setFillColor(c);
									onFillColorChange?.(c);
								}}
							/>
							<ToolbarColorPicker
								label="Stroke color"
								icon={<PencilLine className="wwc:h-4 wwc:w-4" />}
								value={strokeColor}
								onValueChange={(c) => {
									setStrokeColor(c);
									onStrokeColorChange?.(c);
								}}
							/>

							<ToolbarSeparator />

							{/* 4 — Opacity */}
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<span className="wwc:whitespace-nowrap wwc:text-xs wwc:text-muted-foreground">Opacity</span>
								<Slider
									aria-label="Opacity"
									value={[opacity]}
									min={0}
									max={100}
									onValueChange={(v) => {
										setOpacity(v[0]);
										onOpacityChange?.(v[0]);
									}}
									className="wwc:w-20"
								/>
							</div>

							<ToolbarSeparator />

							{/* 5 — Angle snap */}
							<ToolbarButton
								active={angleSnap}
								label={angleSnap ? "Unlock 90° snap" : "Lock to 90° snap"}
								className="wwc:gap-1 wwc:px-2"
								onClick={() => {
									const next = !angleSnap;
									setAngleSnap(next);
									onAngleSnapChange?.(next);
								}}
							>
								{angleSnap ? <Lock className="wwc:!h-3 wwc:!w-3" /> : <LockOpen className="wwc:!h-3 wwc:!w-3" />}
								<span className="wwc:text-xs wwc:font-semibold">90°</span>
							</ToolbarButton>

							<ToolbarSeparator />

							{/* 6 — Actions */}
							<ToolbarButton icon label="Unlink" onClick={onUnlink}>
								<Unlink className="wwc:h-4 wwc:w-4" />
							</ToolbarButton>
							<ToolbarButton variant="outline" className="wwc:gap-1.5 wwc:px-3" onClick={onImport}>
								<Upload className="wwc:h-3.5 wwc:w-3.5" />
								<span className="wwc:text-sm">Import</span>
							</ToolbarButton>
						</>
					)}
				</Toolbar>
			</TooltipProvider>
		);
	},
);
ObjectDrawingToolbar.displayName = "ObjectDrawingToolbar";

export {ObjectDrawingToolbar};
