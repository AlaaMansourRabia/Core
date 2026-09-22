import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const gridVariants = cva("wwc:grid", {
	variants: {
		columns: {
			1: "wwc:grid-cols-1",
			2: "wwc:grid-cols-2",
			3: "wwc:grid-cols-3",
			4: "wwc:grid-cols-4",
			5: "wwc:grid-cols-5",
			6: "wwc:grid-cols-6",
			12: "wwc:grid-cols-12",
		},
		gap: {
			none: "wwc:gap-0",
			xs: "wwc:gap-1",
			sm: "wwc:gap-2",
			md: "wwc:gap-4",
			lg: "wwc:gap-6",
			xl: "wwc:gap-8",
		},
	},
	defaultVariants: {
		columns: 1,
		gap: "md",
	},
});

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {
	/** Render as a different HTML element */
	as?: React.ElementType;
}

/** A CSS Grid layout component for creating grid-based layouts. */
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
	({className, columns, gap, as: Component = "div", ...props}, ref) => {
		return <Component ref={ref} className={cn(gridVariants({columns, gap, className}))} {...props} />;
	},
);
Grid.displayName = "Grid";

export {Grid, gridVariants};
