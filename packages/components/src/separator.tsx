import * as SeparatorPrimitive from "@radix-ui/react-separator";
import {cn} from "@wakecap/core-utils";
import * as React from "react";

/** Visually or semantically separates content. */
const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({className, orientation = "horizontal", decorative = true, ...props}, ref) => (
	<SeparatorPrimitive.Root
		ref={ref}
		decorative={decorative}
		orientation={orientation}
		className={cn(
			"wwc:shrink-0 wwc:bg-border",
			orientation === "horizontal" ? "wwc:h-[1px] wwc:w-full" : "wwc:h-full wwc:w-[1px]",
			className,
		)}
		{...props}
	/>
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export {Separator};
