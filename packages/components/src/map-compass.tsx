import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {Toolbar, ToolbarButton} from "./toolbar";
import {HoverTooltip, TooltipProvider} from "./tooltip";

export interface MapCompassProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** `default` draws the bordered floating surface; `bare` drops it (to nest inside a larger vertical toolbar). */
	variant?: "default" | "bare";
	/** Current map bearing in degrees (0 = north). The needle counter-rotates so it keeps pointing north. */
	bearing?: number;
	/** Called when the button is pressed — realign the map to north. */
	onResetNorth?: () => void;
	/** Accessible label for the button. */
	label?: string;
}

/** Two-tone compass needle: red north half, slate south half. */
function CompassNeedle({bearing = 0}: {bearing?: number}) {
	return (
		<svg
			viewBox="0 0 24 24"
			width="18"
			height="18"
			aria-hidden="true"
			className="wwc:transition-transform"
			style={{transform: `rotate(${-bearing}deg)`}}
		>
			<polygon points="12,2.5 8.5,12 12,10.25 15.5,12" fill="#ef4444" />
			<polygon points="12,21.5 8.5,12 12,13.75 15.5,12" fill="#64748b" />
		</svg>
	);
}

/**
 * A compass-realignment control: a two-tone needle that rotates to reflect the current map `bearing`
 * (staying pointed at north) and, when pressed, calls `onResetNorth` to snap the map back to north.
 * Mirrors the `VerticalZoomTools` UI so it can float over a map or nest (`variant="bare"`) inside a
 * larger vertical toolbar.
 */
const MapCompass = React.forwardRef<HTMLDivElement, MapCompassProps>(
	({className, variant = "default", bearing = 0, onResetNorth, label = "Reset bearing to north", ...rest}, ref) => (
		<TooltipProvider delayDuration={200}>
			<Toolbar
				ref={ref}
				orientation="vertical"
				variant={variant}
				aria-label="Compass"
				className={cn("wwc:w-10 wwc:py-1", className)}
				{...rest}
			>
				<HoverTooltip content={label} side="left">
					<ToolbarButton icon onClick={onResetNorth} label={label}>
						<CompassNeedle bearing={bearing} />
					</ToolbarButton>
				</HoverTooltip>
			</Toolbar>
		</TooltipProvider>
	),
);
MapCompass.displayName = "MapCompass";

export {MapCompass};
