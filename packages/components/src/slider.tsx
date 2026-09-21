import * as SliderPrimitive from "@radix-ui/react-slider";
import {cn} from "@wakecap/core-utils";
import * as React from "react";

/** An input where the user selects a value from within a given range. */
const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({className, ...props}, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn("wwc:relative wwc:flex wwc:w-full wwc:touch-none wwc:select-none wwc:items-center", className)}
		{...props}
	>
		<SliderPrimitive.Track className="wwc:relative wwc:h-1.5 wwc:w-full wwc:grow wwc:overflow-hidden wwc:rounded-full wwc:bg-primary/20">
			<SliderPrimitive.Range className="wwc:absolute wwc:h-full wwc:bg-primary" />
		</SliderPrimitive.Track>
		<SliderPrimitive.Thumb className="wwc:block wwc:h-4 wwc:w-4 wwc:rounded-full wwc:border wwc:border-primary/50 wwc:bg-card wwc:shadow wwc:transition-colors wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:pointer-events-none wwc:disabled:opacity-50" />
	</SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export {Slider};
