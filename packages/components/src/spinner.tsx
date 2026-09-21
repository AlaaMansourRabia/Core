import {cn} from "@wakecap/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const spinnerVariants = cva("wwc:animate-spin wwc:text-muted-foreground", {
	variants: {
		size: {
			default: "wwc:h-4 wwc:w-4",
			sm: "wwc:h-3 wwc:w-3",
			lg: "wwc:h-6 wwc:w-6",
			xl: "wwc:h-8 wwc:w-8",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement>, VariantProps<typeof spinnerVariants> {}

/** A loading spinner animation indicator. */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({className, size, ...props}, ref) => (
	<svg
		ref={ref}
		xmlns="http://www.w3.org/2000/svg"
		// Intrinsic size (matches lucide-react icons) so the spinner still has a box when no
		// stylesheet is present; the `size` utilities below override it whenever CSS is loaded.
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={cn(spinnerVariants({size, className}))}
		{...props}
	>
		<path d="M21 12a9 9 0 1 1-6.219-8.56" />
	</svg>
));
Spinner.displayName = "Spinner";

export {Spinner, spinnerVariants};
