import {Toolbar, ToolbarButton} from "@corensystem/coren-ui/toolbar";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {VerticalZoomTools} from "@corensystem/coren-ui/vertical-zoom-tools";
import {Maximize} from "lucide-react";

import {
	BLUEPRINT_CANVAS_MAX_ZOOM,
	BLUEPRINT_CANVAS_MIN_ZOOM,
	BLUEPRINT_TOOLBAR_ICON_SIZE,
	BLUEPRINT_TOOLBAR_TOOLTIP_DELAY_MS,
} from "./constants";

type BlueprintViewportControlsProps = {
	zoom: number;
	disabled: boolean;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
};

/**
 * Floating viewport controls in the top-right of the blueprint canvas: the
 * design-system map zoom buttons (`VerticalZoomTools`, zoom-in over zoom-out)
 * with a fit-to-view button docked beneath them.
 */
export function BlueprintViewportControls({
	zoom,
	disabled,
	onZoomIn,
	onZoomOut,
	onReset,
}: BlueprintViewportControlsProps) {
	return (
		<TooltipProvider delayDuration={BLUEPRINT_TOOLBAR_TOOLTIP_DELAY_MS}>
			<div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
				<VerticalZoomTools
					zoomLevel={zoom}
					minZoom={BLUEPRINT_CANVAS_MIN_ZOOM}
					maxZoom={BLUEPRINT_CANVAS_MAX_ZOOM}
					canZoomIn={disabled ? false : undefined}
					canZoomOut={disabled ? false : undefined}
					onZoomIn={onZoomIn}
					onZoomOut={onZoomOut}
				/>
				{/* Fit button as its own pill — same vertical Toolbar surface + w-10
				    width as VerticalZoomTools, so both controls match in size (the
				    map-toolbar pill pattern). */}
				<Toolbar orientation="vertical" variant="default" aria-label="Fit view" className="w-10 py-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<ToolbarButton icon label="Fit view" disabled={disabled} onClick={onReset}>
								<Maximize size={BLUEPRINT_TOOLBAR_ICON_SIZE} />
							</ToolbarButton>
						</TooltipTrigger>
						<TooltipContent side="left">Fit view</TooltipContent>
					</Tooltip>
				</Toolbar>
			</div>
		</TooltipProvider>
	);
}
