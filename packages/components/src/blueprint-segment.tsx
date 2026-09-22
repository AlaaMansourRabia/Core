import {cn} from "@corensystem/core-utils";
import {ImageOff, Video} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {FLOAT_SHADOW} from "./float-shadow";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./tooltip";

export interface BlueprintSegmentProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Floor / level label shown in the corner chip, e.g. "GF". */
	label: string;
	/** Completion percentage shown next to the label. Omit to hide it. */
	value?: number;
	/** The blueprint / plan node (e.g. an SVG floor plan). When omitted, a "No blueprint" placeholder shows. */
	plan?: React.ReactNode;
	/** Fires when the walk-through button is pressed. Omit to hide the button. */
	onWalkthrough?: () => void;
	/** Accessible label + tooltip for the walk-through button. Default "Walk-through". */
	walkthroughLabel?: string;
	/** Highlight the segment as active (inset ring). Default false. */
	active?: boolean;
	/**
	 * Drop the rounded card frame (border / radius / background) so the segment sits seamlessly in a
	 * split grid where the parent supplies the dividers. Default false.
	 */
	bare?: boolean;
	/** Extra classes on the label chip (e.g. to offset it below a floating navigator). */
	labelClassName?: string;
}

/**
 * One cell of a multi-floor blueprint split: a framed blueprint (or a "No blueprint" placeholder when
 * `plan` is omitted), a floor label + % chip in the top-left, and an optional walk-through button in the
 * bottom-right (`onWalkthrough`). Tile several to build a split-canvas; pair the walk-through button with
 * a `WalkthroughModal`. Pass `bare` to drop the card frame for a seamless split grid.
 */
const BlueprintSegment = React.forwardRef<HTMLDivElement, BlueprintSegmentProps>(
	(
		{
			className,
			label,
			value,
			plan,
			onWalkthrough,
			walkthroughLabel = "Walk-through",
			active = false,
			bare = false,
			labelClassName,
			...props
		},
		ref,
	) => (
		<div
			ref={ref}
			className={cn(
				"wwc:relative wwc:overflow-hidden",
				!bare && "wwc:rounded-lg wwc:border wwc:border-border wwc:bg-white dark:wwc:bg-zinc-950",
				active && "wwc:z-10 wwc:ring-2 wwc:ring-inset wwc:ring-primary",
				className,
			)}
			{...props}
		>
			{plan != null ? (
				// 14px padding so the blueprint isn't flush to the segment edges.
				<div className="wwc:h-full wwc:w-full wwc:p-[14px]">{plan}</div>
			) : (
				<div className="wwc:flex wwc:h-full wwc:w-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:bg-muted/30 wwc:text-muted-foreground">
					<ImageOff className="wwc:size-6" />
					<span className="wwc:text-xs wwc:font-medium">No blueprint</span>
				</div>
			)}

			<span
				className={cn(
					"wwc:absolute wwc:left-3 wwc:top-3 wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:bg-white/90 wwc:px-2 wwc:py-1 wwc:text-[11px] wwc:font-semibold wwc:text-foreground dark:wwc:bg-zinc-900/90",
					FLOAT_SHADOW,
					labelClassName,
				)}
			>
				<span>{label}</span>
				{value != null && (
					<>
						<span className="wwc:h-3 wwc:w-px wwc:bg-border" aria-hidden="true" />
						<span>{value}%</span>
					</>
				)}
			</span>

			{onWalkthrough && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								variant="outline"
								icon
								size="sm"
								aria-label={`${walkthroughLabel} ${label}`}
								className={cn("wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-20 wwc:bg-background", FLOAT_SHADOW)}
								onClick={onWalkthrough}
							>
								<Video className="wwc:size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top">{walkthroughLabel}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	),
);
BlueprintSegment.displayName = "BlueprintSegment";

export {BlueprintSegment};
