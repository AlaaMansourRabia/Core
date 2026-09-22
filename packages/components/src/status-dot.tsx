import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const statusDotVariants = cva("wwc:inline-block wwc:shrink-0 wwc:rounded-full", {
	variants: {
		variant: {
			success: "wwc:bg-green-500",
			warning: "wwc:bg-amber-500",
			error: "wwc:bg-red-500",
			info: "wwc:bg-blue-500",
			neutral: "wwc:bg-muted-foreground",
			offline: "wwc:bg-muted-foreground/50",
		},
		size: {
			xs: "wwc:h-1.5 wwc:w-1.5",
			sm: "wwc:h-2 wwc:w-2",
			md: "wwc:h-2.5 wwc:w-2.5",
			lg: "wwc:h-3 wwc:w-3",
		},
		/** Shape provides accessibility - status is not conveyed by color alone (WCAG 1.4.1) */
		shape: {
			filled: "", // Default filled circle
			ring: "wwc:bg-transparent wwc:border-2 wwc:border-current",
			minus:
				"wwc:relative after:wwc:absolute after:wwc:inset-x-0.5 after:wwc:top-1/2 after:wwc:-translate-y-1/2 after:wwc:h-0.5 after:wwc:bg-background after:wwc:rounded-full",
		},
		pulse: {
			true: "wwc:animate-pulse",
			false: "",
		},
	},
	compoundVariants: [
		// Ring variant needs text color instead of bg
		{variant: "success", shape: "ring", class: "wwc:text-green-500 wwc:bg-transparent"},
		{variant: "warning", shape: "ring", class: "wwc:text-amber-500 wwc:bg-transparent"},
		{variant: "error", shape: "ring", class: "wwc:text-red-500 wwc:bg-transparent"},
		{variant: "info", shape: "ring", class: "wwc:text-blue-500 wwc:bg-transparent"},
		{variant: "neutral", shape: "ring", class: "wwc:text-muted-foreground wwc:bg-transparent"},
		{variant: "offline", shape: "ring", class: "wwc:text-muted-foreground/50 wwc:bg-transparent"},
	],
	defaultVariants: {
		variant: "neutral",
		size: "md",
		shape: "filled",
		pulse: false,
	},
});

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusDotVariants> {
	/** Accessible label describing the status */
	label?: string;
}

/** A small colored dot that communicates status like online/offline presence or severity levels. */
const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
	({className, variant, size, shape, pulse, label, ...props}, ref) => (
		<span
			ref={ref}
			role="status"
			aria-label={label}
			className={cn(statusDotVariants({variant, size, shape, pulse}), className)}
			{...props}
		/>
	),
);
StatusDot.displayName = "StatusDot";

export {StatusDot, statusDotVariants};
