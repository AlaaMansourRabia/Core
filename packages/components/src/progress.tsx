import * as ProgressPrimitive from "@radix-ui/react-progress";
import {cn} from "@core/core-utils";
import * as React from "react";

export type ProgressTone = "primary" | "success" | "warning" | "danger";

const TONE_TRACK: Record<ProgressTone, string> = {
	primary: "wwc:bg-primary/20",
	success: "wwc:bg-green-500/20",
	warning: "wwc:bg-amber-500/20",
	danger: "wwc:bg-red-500/20",
};

const TONE_INDICATOR: Record<ProgressTone, string> = {
	primary: "wwc:bg-primary",
	success: "wwc:bg-green-500",
	warning: "wwc:bg-amber-500",
	danger: "wwc:bg-red-500",
};

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
	/** Semantic colour of the bar. Defaults to `primary`. */
	tone?: ProgressTone;
}

/** Displays an indicator showing the completion progress of a task. */
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
	({className, value, tone = "primary", ...props}, ref) => (
		<ProgressPrimitive.Root
			ref={ref}
			className={cn(
				"wwc:relative wwc:h-2 wwc:w-full wwc:overflow-hidden wwc:rounded-full",
				TONE_TRACK[tone],
				className,
			)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				className={cn("wwc:h-full wwc:w-full wwc:flex-1 wwc:transition-all", TONE_INDICATOR[tone])}
				style={{transform: `translateX(-${100 - (value || 0)}%)`}}
			/>
		</ProgressPrimitive.Root>
	),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export {Progress};
