import {cn} from "@corensystem/coren-utils";
import * as React from "react";

/** Groups related buttons together with consistent spacing and styling. */
const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn("wwc:inline-flex wwc:items-center wwc:justify-center wwc:rounded-md", className)}
			{...props}
		/>
	),
);
ButtonGroup.displayName = "ButtonGroup";

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
	({className, ...props}, ref) => (
		<button
			ref={ref}
			className={cn(
				"wwc:inline-flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:whitespace-nowrap wwc:text-sm wwc:font-medium wwc:transition-colors wwc:[&_svg]:pointer-events-none wwc:[&_svg]:size-4 wwc:[&_svg]:shrink-0",
				"wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
				"wwc:disabled:pointer-events-none wwc:disabled:opacity-50",
				"wwc:border wwc:border-input wwc:bg-card wwc:hover:bg-accent wwc:hover:text-accent-foreground",
				"wwc:h-9 wwc:px-4 wwc:py-2",
				"wwc:rounded-none wwc:border-r-0 wwc:first:rounded-l-md wwc:last:rounded-r-md wwc:last:border-r",
				className,
			)}
			{...props}
		/>
	),
);
ButtonGroupItem.displayName = "ButtonGroupItem";

export {ButtonGroup, ButtonGroupItem};
