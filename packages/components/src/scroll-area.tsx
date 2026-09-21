import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import {cn} from "@wakecap/core-utils";
import * as React from "react";

/** A custom scrollable area with styled scrollbars built on Radix. */
const ScrollArea = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
		/** Extra classes for the scrollbar track — e.g. a narrower `w-1.5` on a dense surface. */
		scrollbarClassName?: string;
		/** Extra classes for the scrollbar thumb — e.g. a lighter `bg-border/60`. */
		thumbClassName?: string;
		/**
		 * Constrain the content to the viewport's width instead of letting it size to itself.
		 *
		 * Radix renders the viewport's child as `display: table`, which is how it measures content — and
		 * which means a wide child (a long unbroken path, a table) makes that child wider than the
		 * scroll area. Anything positioned against its right edge, including padding meant to clear the
		 * scrollbar, then sits outside the visible box. Set this on any FIXED-WIDTH panel whose content
		 * should wrap or truncate rather than overflow. Off by default, so a pane that scrolls
		 * horizontally on purpose is unaffected.
		 */
		fitWidth?: boolean;
	}
>(({className, children, scrollbarClassName, thumbClassName, fitWidth, ...props}, ref) => (
	<ScrollAreaPrimitive.Root ref={ref} className={cn("wwc:relative wwc:overflow-hidden", className)} {...props}>
		<ScrollAreaPrimitive.Viewport
			className={cn("wwc:h-full wwc:w-full wwc:rounded-[inherit]", fitWidth && "wwc:[&>div]:!block")}
		>
			{children}
		</ScrollAreaPrimitive.Viewport>
		<ScrollBar className={scrollbarClassName} thumbClassName={thumbClassName} />
		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {thumbClassName?: string}
>(({className, orientation = "vertical", thumbClassName, ...props}, ref) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		ref={ref}
		orientation={orientation}
		className={cn(
			"wwc:flex wwc:touch-none wwc:select-none wwc:transition-colors",
			orientation === "vertical" && "wwc:h-full wwc:w-2.5 wwc:border-l wwc:border-l-transparent wwc:p-[1px]",
			orientation === "horizontal" && "wwc:h-2.5 wwc:flex-col wwc:border-t wwc:border-t-transparent wwc:p-[1px]",
			className,
		)}
		{...props}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb
			className={cn("wwc:relative wwc:flex-1 wwc:rounded-full wwc:bg-border", thumbClassName)}
		/>
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export {ScrollArea, ScrollBar};
