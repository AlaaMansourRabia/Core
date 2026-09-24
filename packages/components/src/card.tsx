import {cn} from "@corensystem/coren-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const cardVariants = cva("wwc:border wwc:text-card-foreground", {
	variants: {
		variant: {
			/** Default surface: large radius with a drop shadow. */
			default: "wwc:rounded-xl wwc:bg-card wwc:shadow",
			/** Compact, flat, white stat tile: medium radius, no shadow — used for dense metric bars. */
			stat: "wwc:rounded-md wwc:bg-white",
			/** Frosted list surface: soft muted fill, blurred, with a lifted drop shadow — used for floor/section lists. */
			floor: "wwc:rounded wwc:bg-muted wwc:shadow-lg wwc:backdrop-blur-lg",
			/** Translucent glass panel that floats over 3D/map content — used for floating inspector panels. */
			floating: "wwc:rounded wwc:border-border/50 wwc:bg-background/80 wwc:shadow-lg wwc:backdrop-blur-lg",
			/** Translucent glass surface for an object-inspector panel (header + body sections + footer). */
			object: "wwc:rounded wwc:border-border/50 wwc:bg-background/80 wwc:shadow-lg wwc:backdrop-blur-lg",
			/** Near-opaque frosted kiosk surface for always-on TV displays — heavier shadow, subtle blur. */
			tv: "wwc:rounded wwc:border-border/50 wwc:bg-background/95 wwc:shadow-xl wwc:backdrop-blur",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

/** A versatile container with composable sub-components for grouped content. */
const Card = React.forwardRef<HTMLDivElement, CardProps>(({className, variant, ...props}, ref) => (
	<div ref={ref} className={cn(cardVariants({variant}), className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:flex wwc:flex-col wwc:space-y-1.5 wwc:p-6", className)} {...props} />
	),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:font-semibold wwc:leading-none wwc:tracking-tight", className)} {...props} />
	),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
	),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => <div ref={ref} className={cn("wwc:p-6 wwc:pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:flex wwc:items-center wwc:p-6 wwc:pt-0", className)} {...props} />
	),
);
CardFooter.displayName = "CardFooter";

export {Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants};
