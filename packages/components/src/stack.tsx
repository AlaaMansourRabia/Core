import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const stackVariants = cva("wwc:flex", {
	variants: {
		direction: {
			row: "wwc:flex-row",
			column: "wwc:flex-col",
		},
		gap: {
			none: "wwc:gap-0",
			xs: "wwc:gap-1",
			sm: "wwc:gap-2",
			md: "wwc:gap-4",
			lg: "wwc:gap-6",
			xl: "wwc:gap-8",
		},
		align: {
			start: "wwc:items-start",
			center: "wwc:items-center",
			end: "wwc:items-end",
			stretch: "wwc:items-stretch",
			baseline: "wwc:items-baseline",
		},
		justify: {
			start: "wwc:justify-start",
			center: "wwc:justify-center",
			end: "wwc:justify-end",
			between: "wwc:justify-between",
			around: "wwc:justify-around",
			evenly: "wwc:justify-evenly",
		},
	},
	defaultVariants: {
		direction: "column",
		gap: "md",
		align: "stretch",
		justify: "start",
	},
});

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {
	/** Render as a different HTML element */
	as?: React.ElementType;
}

/** A flex layout component for arranging elements in a row or column. */
const Stack = React.forwardRef<HTMLDivElement, StackProps>(
	({className, direction, gap, align, justify, as: Component = "div", ...props}, ref) => {
		return (
			<Component ref={ref} className={cn(stackVariants({direction, gap, align, justify, className}))} {...props} />
		);
	},
);
Stack.displayName = "Stack";

export {Stack, stackVariants};
