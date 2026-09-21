import {cn} from "@wakecap/core-utils";
import * as React from "react";

import {CanvasFilePicker} from "./canvas-file-picker";
import {DrawingActions, type DrawingActionsProps} from "./drawing-actions";
import {Toolbar, ToolbarGroup} from "./toolbar";
import {ToolbarPager} from "./toolbar-pager";
import {ZoomTools, type ZoomToolsProps} from "./zoom-tools";

export interface CanvasToolbarBlueprint {
	id: string;
	name: string;
	disabled?: boolean;
}

export interface CanvasToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Blueprints available for selection in the left section. */
	blueprints: CanvasToolbarBlueprint[];
	/** Currently active blueprint id. */
	activeBlueprintId: string;
	onBlueprintChange?: (id: string) => void;
	/** Render the blueprint picker as a searchable Combobox instead of a Select. */
	searchableBlueprints?: boolean;
	/** Placeholder shown inside the searchable picker's input. */
	blueprintSearchPlaceholder?: string;
	/** Trigger width for the blueprint picker. */
	blueprintTriggerWidth?: number;
	/** Number of trailing characters always kept visible in middle truncation. */
	blueprintTailChars?: number;
	/** 1-based current page index. When omitted (or pageCount <= 1) the pager is hidden. */
	pageIndex?: number;
	/** Total number of pages in the active blueprint. */
	pageCount?: number;
	onPageChange?: (next: number) => void;
	/** Drawing tools props. Pass `null` to hide the middle section. */
	drawingActions?: DrawingActionsProps | null;
	/** Zoom tools props. Pass `null` to hide the right section. */
	zoomTools?: ZoomToolsProps | null;
}

/** Strip the nested section toolbars of their own chrome so the host toolbar owns it. */
const NESTED_TOOLBAR = "wwc:h-10 wwc:border-0 wwc:bg-transparent wwc:px-0";

const CanvasToolbar = React.forwardRef<HTMLDivElement, CanvasToolbarProps>(
	(
		{
			className,
			blueprints,
			activeBlueprintId,
			onBlueprintChange,
			searchableBlueprints = false,
			blueprintSearchPlaceholder = "Search blueprints...",
			blueprintTriggerWidth = 180,
			blueprintTailChars = 7,
			pageIndex,
			pageCount,
			onPageChange,
			drawingActions,
			zoomTools,
			...rest
		},
		ref,
	) => {
		const showPager = pageCount !== undefined && pageCount > 1 && pageIndex !== undefined;
		const showDrawing = drawingActions !== null && drawingActions !== undefined;
		const showZoom = zoomTools !== null && zoomTools !== undefined;

		return (
			<Toolbar ref={ref} fullWidth aria-label="Canvas toolbar" className={cn("wwc:gap-1", className)} {...rest}>
				<ToolbarGroup grow align="start" className="wwc:gap-1.5 wwc:px-1">
					<CanvasFilePicker
						files={blueprints}
						activeFileId={activeBlueprintId}
						onFileChange={onBlueprintChange}
						searchable={searchableBlueprints}
						searchPlaceholder={blueprintSearchPlaceholder}
						triggerWidth={blueprintTriggerWidth}
						tailChars={blueprintTailChars}
					/>
					{showPager && (
						<ToolbarPager index={pageIndex} count={pageCount} onIndexChange={onPageChange} className="wwc:pl-1" />
					)}
				</ToolbarGroup>

				{showDrawing && (
					<ToolbarGroup align="center" className="wwc:shrink-0">
						<DrawingActions {...drawingActions} className={NESTED_TOOLBAR} />
					</ToolbarGroup>
				)}

				<ToolbarGroup grow align="end">
					{showZoom && <ZoomTools {...zoomTools} className={NESTED_TOOLBAR} />}
				</ToolbarGroup>
			</Toolbar>
		);
	},
);
CanvasToolbar.displayName = "CanvasToolbar";

export {CanvasToolbar};
