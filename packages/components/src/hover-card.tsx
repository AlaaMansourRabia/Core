import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {cn} from "@wakecap/core-utils";
import * as React from "react";

/** A card that appears when the user hovers over a trigger element. */
function HoverCard(props: React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>) {
	return <HoverCardPrimitive.Root {...props} />;
}
const HoverCardTrigger: typeof HoverCardPrimitive.Trigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
	React.ElementRef<typeof HoverCardPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({className, align = "start", sideOffset = 4, ...props}, ref) => (
	<HoverCardPrimitive.Content
		ref={ref}
		align={align}
		sideOffset={sideOffset}
		className={cn(
			"wwc:z-50 wwc:w-64 wwc:rounded-md wwc:border wwc:bg-popover wwc:p-4 wwc:text-popover-foreground wwc:shadow-md wwc:outline-none wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		{...props}
	/>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export {HoverCard, HoverCardTrigger, HoverCardContent};
