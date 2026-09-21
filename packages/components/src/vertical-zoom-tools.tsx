import {cn} from "@wakecap/core-utils";
import {ZoomIn, ZoomOut} from "lucide-react";
import * as React from "react";

import {Toolbar, ToolbarButton, ToolbarSeparator} from "./toolbar";
import {HoverTooltip, TooltipProvider} from "./tooltip";

/** Wraps a toolbar button with a hover/focus tooltip naming it (tooltips sit left of a right-edge toolbar). */
function Tip({label, children}: {label: string; children: React.ReactNode}) {
	return (
		<HoverTooltip content={label} side="left">
			{children}
		</HoverTooltip>
	);
}

export interface VerticalZoomToolsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** `default` draws the bordered floating surface; `bare` drops it (to nest inside a larger vertical toolbar). */
	variant?: "default" | "bare";
	/** Current zoom level as a multiplier (1 = 100%). Used to auto-derive the enabled state of each button. */
	zoomLevel?: number;
	/** Minimum allowed zoom level. */
	minZoom?: number;
	/** Maximum allowed zoom level. */
	maxZoom?: number;
	/** Override the auto-derived canZoomIn flag. */
	canZoomIn?: boolean;
	/** Override the auto-derived canZoomOut flag. */
	canZoomOut?: boolean;
	onZoomIn?: () => void;
	onZoomOut?: () => void;
}

/**
 * A compact, vertical zoom control (zoom in over zoom out) intended to float over a map or canvas.
 * The vertical counterpart to `ZoomTools`; built on the orientation-aware `Toolbar` primitive so it
 * can be the first section of a larger vertical floating toolbar — pass `variant="bare"` to nest it.
 */
const VerticalZoomTools = React.forwardRef<HTMLDivElement, VerticalZoomToolsProps>(
	(
		{
			className,
			variant = "default",
			zoomLevel = 1,
			minZoom = 0.1,
			maxZoom = 10,
			canZoomIn,
			canZoomOut,
			onZoomIn,
			onZoomOut,
			...rest
		},
		ref,
	) => {
		const zoomInEnabled = canZoomIn ?? zoomLevel < maxZoom;
		const zoomOutEnabled = canZoomOut ?? zoomLevel > minZoom;

		return (
			<TooltipProvider delayDuration={200}>
				<Toolbar
					ref={ref}
					orientation="vertical"
					variant={variant}
					aria-label="Zoom"
					className={cn("wwc:w-10 wwc:gap-0 wwc:py-1", className)}
					{...rest}
				>
					<Tip label="Zoom in">
						<ToolbarButton icon onClick={onZoomIn} disabled={!zoomInEnabled} label="Zoom in">
							<ZoomIn className="wwc:h-4 wwc:w-4" />
						</ToolbarButton>
					</Tip>
					<ToolbarSeparator orientation="horizontal" className="wwc:mx-0 wwc:my-0.5 wwc:w-full" />
					<Tip label="Zoom out">
						<ToolbarButton icon onClick={onZoomOut} disabled={!zoomOutEnabled} label="Zoom out">
							<ZoomOut className="wwc:h-4 wwc:w-4" />
						</ToolbarButton>
					</Tip>
				</Toolbar>
			</TooltipProvider>
		);
	},
);
VerticalZoomTools.displayName = "VerticalZoomTools";

export {VerticalZoomTools};
