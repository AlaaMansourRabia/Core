import {cn} from "@corensystem/coren-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

// The fill + marker take their colour from the root's `text-*` (set by `tone`) via `bg-current`,
// so the whole indicator re-themes from one token; the remaining track is a muted rail.
const floorProgressBarVariants = cva("wwc:absolute wwc:inset-x-0 wwc:bottom-0 wwc:flex wwc:items-center wwc:gap-px", {
	variants: {
		tone: {
			neutral: "wwc:text-muted-foreground",
			primary: "wwc:text-primary",
		},
	},
	defaultVariants: {
		tone: "neutral",
	},
});

export interface FloorProgressBarProps
	extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof floorProgressBarVariants> {
	/** Completion percentage, clamped to 0–100. */
	value: number;
	/** Show the remaining (unfilled) track behind the bar. Defaults to `true`. */
	showTrack?: boolean;
}

/** A thin determinate progress bar with a marker tick, sized to overlay the bottom edge of a floor tile. */
const FloorProgressBar = React.forwardRef<HTMLDivElement, FloorProgressBarProps>(
	({className, tone, value, showTrack = true, ...props}, ref) => {
		const width = Math.min(100, Math.max(0, Math.round(value)));
		return (
			<div
				ref={ref}
				role="progressbar"
				aria-valuenow={width}
				aria-valuemin={0}
				aria-valuemax={100}
				className={cn(floorProgressBarVariants({tone}), className)}
				{...props}
			>
				<div className="wwc:h-0.5 wwc:shrink-0 wwc:bg-current" style={{width: `${width}%`}} />
				<div className="wwc:h-1 wwc:w-px wwc:shrink-0 wwc:rounded-full wwc:bg-current" />
				<div className={cn("wwc:h-0.5 wwc:min-w-px wwc:flex-1 wwc:bg-muted", showTrack ? "" : "wwc:opacity-0")} />
			</div>
		);
	},
);
FloorProgressBar.displayName = "FloorProgressBar";

export {FloorProgressBar, floorProgressBarVariants};
