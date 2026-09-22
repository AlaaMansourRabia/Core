import {Button} from "@core/core-ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@core/core-ui/popover";
import {Slider} from "@core/core-ui/slider";
import {
	Toolbar,
	ToolbarButton,
	ToolbarMenuButton,
	type ToolbarMenuOption,
	ToolbarSeparator,
} from "@core/core-ui/toolbar";
import {ToolbarColorPicker} from "@core/core-ui/toolbar-color-picker";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@core/core-ui/tooltip";
import {
	Blend,
	Box,
	BringToFront,
	Cloud,
	Copy,
	Hand,
	Library,
	Lock,
	LockOpen,
	Minus,
	MousePointer2,
	PaintBucket,
	Pencil,
	PencilLine,
	Pentagon,
	Search,
	SendToBack,
	Square,
	Unlink,
	Upload,
	X,
} from "lucide-react";
import {useState, type ReactNode} from "react";

import type {CanvasObject} from "./canvas-object-types";
import {
	BLUEPRINT_MENU_ICON_SIZE,
	BLUEPRINT_PERCENT_SCALE,
	BLUEPRINT_POLYGON_MIN_POINTS,
	BLUEPRINT_TOOLBAR_ICON_SIZE,
	BLUEPRINT_TOOLBAR_TOOLTIP_DELAY_MS,
} from "./constants";
import type {CanvasObjectOrderAction, DraftStyle, ShapeTool} from "./types";

type BlueprintCanvasToolbarProps = {
	editMode: boolean;
	tool: ShapeTool;
	orthogonalMode: boolean;
	style: DraftStyle;
	selectedShape: CanvasObject | null;
	polygonDraftCount: number;
	isSaving: boolean;
	onEditModeChange: (value: boolean) => void;
	onToolChange: (value: ShapeTool) => void;
	onOrthogonalModeChange: (value: boolean) => void;
	onStyleChange: (value: DraftStyle) => void;
	onAssignSelected: () => void;
	onDuplicate: () => void;
	onToggleLock: () => void;
	onOrder: (action: CanvasObjectOrderAction) => void;
	onUnlink: () => void;
	onImportRoshn?: () => void;
	onFinishPolygon: () => void;
	onCancelDraft: () => void;
	isOpenSpaceConfigured: boolean;
	onImportOpenSpace: () => void;
	onSelectFromLibrary: () => void;
};

/** Layer-order options for the "Arrange" single-select toolbar menu button. */
const ARRANGE_OPTIONS: ToolbarMenuOption<CanvasObjectOrderAction>[] = [
	{
		id: "forward",
		label: "Bring forward",
		icon: <BringToFront size={BLUEPRINT_MENU_ICON_SIZE} />,
	},
	{
		id: "front",
		label: "Bring to front",
		icon: <BringToFront size={BLUEPRINT_MENU_ICON_SIZE} />,
	},
	{
		id: "backward",
		label: "Send backward",
		icon: <SendToBack size={BLUEPRINT_MENU_ICON_SIZE} />,
	},
	{
		id: "back",
		label: "Send to back",
		icon: <SendToBack size={BLUEPRINT_MENU_ICON_SIZE} />,
	},
];

/** An icon-only tool button with a hover tooltip. */
function ToolButton({
	label,
	active,
	disabled,
	onClick,
	children,
}: {
	label: string;
	active?: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<ToolbarButton icon label={label} active={active} disabled={disabled} onClick={onClick}>
					{children}
				</ToolbarButton>
			</TooltipTrigger>
			<TooltipContent side="bottom">{label}</TooltipContent>
		</Tooltip>
	);
}

/**
 * Fixed top bar for the blueprint canvas, composed from the design-system
 * toolbar primitives in a single row: edit toggle, select/pan, shape tools
 * (with a 2.5D cube in place of the circle), fill/stroke colors, an opacity
 * popover, the 90° snap toggle, and unlink / import actions. Every tool exposes
 * a hover tooltip. When a shape is selected the Import button is hidden and a
 * contextual group of selected-shape tools (assign, duplicate, lock, arrange)
 * takes its place; polygon Finish/Cancel render as a trailing group.
 */
export function BlueprintCanvasToolbar({
	editMode,
	tool,
	orthogonalMode,
	style,
	selectedShape,
	polygonDraftCount,
	isSaving,
	onEditModeChange,
	onToolChange,
	onOrthogonalModeChange,
	onStyleChange,
	onAssignSelected,
	onDuplicate,
	onToggleLock,
	onOrder,
	onUnlink,
	onImportRoshn,
	onFinishPolygon,
	onCancelDraft,
	isOpenSpaceConfigured,
	onImportOpenSpace,
	onSelectFromLibrary,
}: BlueprintCanvasToolbarProps) {
	const opacityPercent = Math.round(style.opacity * BLUEPRINT_PERCENT_SCALE);
	// Last-used layer-order action, so the Arrange menu button reflects it as a
	// single-select picker (its icon shows on the trigger, its row highlighted).
	const [arrangeValue, setArrangeValue] = useState<CanvasObjectOrderAction>("forward");

	return (
		<TooltipProvider delayDuration={BLUEPRINT_TOOLBAR_TOOLTIP_DELAY_MS}>
			<Toolbar
				variant="bare"
				aria-label="Blueprint drawing tools"
				className="w-full items-center gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2"
			>
				{/* Edit toggle: "Edit" label when closed, X to exit when open */}
				{editMode ? (
					<ToolButton label="Stop editing" active onClick={() => onEditModeChange(false)}>
						<X size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
					</ToolButton>
				) : (
					<Button type="button" size="sm" variant="outline" onClick={() => onEditModeChange(true)}>
						<Pencil size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
						Edit
					</Button>
				)}

				{editMode ? (
					<>
						<ToolbarSeparator orientation="vertical" />

						{/* Select / pan */}
						<ToolButton label="Select" active={tool === "select"} onClick={() => onToolChange("select")}>
							<MousePointer2 size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
						</ToolButton>
						<ToolButton label="Pan" active={tool === "pan"} onClick={() => onToolChange("pan")}>
							<Hand size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
						</ToolButton>

						<ToolbarSeparator orientation="vertical" />

						{/* Shape tools (cube replaces circle → 2.5D faces) */}
						<ToolButton label="Line" active={tool === "line"} onClick={() => onToolChange("line")}>
							<Minus size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
						</ToolButton>
						<ToolButton
							label="2.5D faces"
							active={tool === "extruded-polygon"}
							onClick={() => onToolChange("extruded-polygon")}
						>
							<Box size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
						</ToolButton>
						<ToolButton label="Rectangle" active={tool === "rectangle"} onClick={() => onToolChange("rectangle")}>
							<Square size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
						</ToolButton>
						<ToolButton label="Polygon" active={tool === "polygon"} onClick={() => onToolChange("polygon")}>
							<Pentagon size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
						</ToolButton>

						<ToolbarSeparator orientation="vertical" />

						{/* Fill / stroke colors + opacity popover */}
						<ToolbarColorPicker
							label="Fill color"
							icon={<PaintBucket size={BLUEPRINT_MENU_ICON_SIZE} />}
							value={style.fillEnabled ? style.fillColor : ""}
							onValueChange={(color) =>
								onStyleChange({
									...style,
									fillEnabled: color !== "",
									fillColor: color === "" ? style.fillColor : color,
								})
							}
						/>
						<ToolbarColorPicker
							label="Stroke color"
							icon={<PencilLine size={BLUEPRINT_MENU_ICON_SIZE} />}
							value={style.strokeEnabled ? style.strokeColor : ""}
							onValueChange={(color) =>
								onStyleChange({
									...style,
									strokeEnabled: color !== "",
									strokeColor: color === "" ? style.strokeColor : color,
								})
							}
						/>
						<Popover>
							<Tooltip>
								<TooltipTrigger asChild>
									<PopoverTrigger asChild>
										<ToolbarButton icon label="Opacity">
											<Blend size={BLUEPRINT_MENU_ICON_SIZE} />
										</ToolbarButton>
									</PopoverTrigger>
								</TooltipTrigger>
								<TooltipContent side="bottom">Opacity</TooltipContent>
							</Tooltip>
							<PopoverContent align="start" className="w-48">
								<div className="flex flex-col gap-2">
									<span className="text-xs font-medium text-foreground">Opacity</span>
									<div className="flex items-center gap-2">
										<Slider
											aria-label="Opacity"
											value={[opacityPercent]}
											min={0}
											max={BLUEPRINT_PERCENT_SCALE}
											onValueChange={([value]) =>
												onStyleChange({
													...style,
													opacity: value / BLUEPRINT_PERCENT_SCALE,
												})
											}
										/>
										<span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{opacityPercent}%</span>
									</div>
								</div>
							</PopoverContent>
						</Popover>

						<ToolbarSeparator orientation="vertical" />

						{/* 90° snap */}
						<Tooltip>
							<TooltipTrigger asChild>
								<ToolbarButton
									active={orthogonalMode}
									label={orthogonalMode ? "Unlock 90° snap" : "Lock to 90° snap"}
									className="gap-1 px-2"
									onClick={() => onOrthogonalModeChange(!orthogonalMode)}
								>
									{orthogonalMode ? (
										<Lock size={BLUEPRINT_MENU_ICON_SIZE} />
									) : (
										<LockOpen size={BLUEPRINT_MENU_ICON_SIZE} />
									)}
									<span className="text-xs font-semibold">90°</span>
								</ToolbarButton>
							</TooltipTrigger>
							<TooltipContent side="bottom">{orthogonalMode ? "Unlock 90° snap" : "Lock to 90° snap"}</TooltipContent>
						</Tooltip>

						{/* Unlink + Import are hidden while a shape is selected — the
						    selected-shape tools take their place. */}
						{!selectedShape ? (
							<>
								<ToolbarSeparator orientation="vertical" />
								<ToolButton label="Unlink blueprint" onClick={onUnlink}>
									<Unlink size={BLUEPRINT_MENU_ICON_SIZE} />
								</ToolButton>
								{onImportRoshn ? (
									<Button type="button" size="sm" variant="outline" onClick={onImportRoshn} disabled={isSaving}>
										<Upload size={BLUEPRINT_MENU_ICON_SIZE} />
										Import
									</Button>
								) : null}
							</>
						) : null}

						{/* Selected-shape tools (icons) */}
						{selectedShape ? (
							<>
								<ToolbarSeparator orientation="vertical" />
								<ToolButton
									label="Assign LBS item"
									disabled={selectedShape.isLocked || isSaving}
									onClick={onAssignSelected}
								>
									<Search size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
								</ToolButton>
								<ToolButton label="Duplicate" disabled={isSaving} onClick={onDuplicate}>
									<Copy size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
								</ToolButton>
								<ToolButton
									label={selectedShape.isLocked ? "Unlock" : "Lock"}
									active={selectedShape.isLocked}
									disabled={isSaving}
									onClick={onToggleLock}
								>
									{selectedShape.isLocked ? (
										<Lock size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
									) : (
										<LockOpen size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
									)}
								</ToolButton>
								<ToolbarMenuButton
									label="Arrange"
									value={arrangeValue}
									align="start"
									disabled={isSaving}
									options={ARRANGE_OPTIONS}
									onSelect={(id) => {
										setArrangeValue(id);
										onOrder(id);
									}}
								/>
							</>
						) : null}

						{polygonDraftCount > 0 ? (
							<div className="ml-auto flex items-center gap-2 border-l border-border pl-2">
								<span className="text-xs text-muted-foreground">{polygonDraftCount} points</span>
								<Button
									type="button"
									size="sm"
									onClick={onFinishPolygon}
									disabled={polygonDraftCount < BLUEPRINT_POLYGON_MIN_POINTS || isSaving}
								>
									Finish
								</Button>
								<Button type="button" size="sm" variant="outline" onClick={onCancelDraft}>
									Cancel
								</Button>
							</div>
						) : null}
					</>
				) : (
					/* Blueprint-source actions, only while not editing */
					<div className="ml-auto flex items-center gap-2">
						{isOpenSpaceConfigured ? (
							<Button type="button" size="sm" variant="outline" onClick={onImportOpenSpace}>
								<Cloud size={BLUEPRINT_MENU_ICON_SIZE} />
								Import from OpenSpace
							</Button>
						) : null}
						<Button type="button" size="sm" variant="outline" onClick={onSelectFromLibrary}>
							<Library size={BLUEPRINT_MENU_ICON_SIZE} />
							Select from Library
						</Button>
					</div>
				)}
			</Toolbar>
		</TooltipProvider>
	);
}
