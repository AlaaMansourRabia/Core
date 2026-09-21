import {cn} from "@core/core-utils";
import * as React from "react";

/**
 * Analytics surface container: a bordered, clipped card whose header sits on a muted grey bar so the
 * title reads as a distinct band above the content. Shared shell for chart tiles, metric tiles and
 * data tables so every analytics widget frames its content the same way.
 */
const WidgetCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground wwc:shadow-(--shadow-surface)",
				className,
			)}
			{...props}
		/>
	),
);
WidgetCard.displayName = "WidgetCard";

/** Grey header band. Lays out the title on the left and any actions on the right. */
const WidgetCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:flex wwc:min-h-10 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:border-border wwc:bg-muted wwc:px-4 wwc:py-2",
				className,
			)}
			{...props}
		/>
	),
);
WidgetCardHeader.displayName = "WidgetCardHeader";

const WidgetCardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn("wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:font-medium wwc:leading-none", className)}
			{...props}
		/>
	),
);
WidgetCardTitle.displayName = "WidgetCardTitle";

/** Right-aligned slot in the header band for icons, menus or toggles. */
const WidgetCardActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn("wwc:flex wwc:items-center wwc:gap-1 wwc:text-muted-foreground", className)}
			{...props}
		/>
	),
);
WidgetCardActions.displayName = "WidgetCardActions";

/** Content area below the header band. */
const WidgetCardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => <div ref={ref} className={cn("wwc:p-4", className)} {...props} />,
);
WidgetCardBody.displayName = "WidgetCardBody";

export {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardActions, WidgetCardBody};
