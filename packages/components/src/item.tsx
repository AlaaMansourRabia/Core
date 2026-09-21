import {cn} from "@wakecap/core-utils";
import * as React from "react";

/** A layout component for displaying items with a title, description, and optional actions. */
const Item = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:flex wwc:items-center wwc:justify-between wwc:py-4", className)} {...props} />
));
Item.displayName = "Item";

const ItemContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => <div ref={ref} className={cn("wwc:flex-1 wwc:space-y-1", className)} {...props} />,
);
ItemContent.displayName = "ItemContent";

const ItemTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:text-sm wwc:font-medium wwc:leading-none", className)} {...props} />
	),
);
ItemTitle.displayName = "ItemTitle";

const ItemDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
	),
);
ItemDescription.displayName = "ItemDescription";

export {Item, ItemContent, ItemTitle, ItemDescription};
