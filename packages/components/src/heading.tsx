import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const headingVariants = cva("wwc:font-semibold wwc:tracking-tight", {
	variants: {
		level: {
			h1: "wwc:text-4xl wwc:lg:text-5xl",
			h2: "wwc:text-3xl wwc:lg:text-4xl",
			h3: "wwc:text-2xl wwc:lg:text-3xl",
			h4: "wwc:text-xl wwc:lg:text-2xl",
			h5: "wwc:text-lg wwc:lg:text-xl",
			h6: "wwc:text-base wwc:lg:text-lg",
		},
		variant: {
			default: "wwc:text-foreground",
			muted: "wwc:text-muted-foreground",
			accent: "wwc:text-primary",
		},
	},
	defaultVariants: {
		level: "h2",
		variant: "default",
	},
});

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
	/** Override the semantic HTML tag while keeping the visual style */
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/** Semantic heading element with consistent typography. */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
	({className, level, variant, as, ...props}, ref) => {
		const Component = as || level || "h2";
		return <Component ref={ref} className={cn(headingVariants({level: level || as, variant, className}))} {...props} />;
	},
);
Heading.displayName = "Heading";

export {Heading, headingVariants};
