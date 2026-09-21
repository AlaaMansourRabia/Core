import * as SwitchPrimitives from "@radix-ui/react-switch";
import {cn} from "@wakecap/core-utils";
import * as React from "react";

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, "size"> {
	/** `sm` for dense surfaces — floating panels, toolbars, table rows. Default `default`. */
	size?: "default" | "sm";
}

/** A toggle control that switches between on and off states. */
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
	({className, size = "default", ...props}, ref) => (
		<SwitchPrimitives.Root
			className={cn(
				"wwc:peer wwc:inline-flex wwc:shrink-0 wwc:cursor-pointer wwc:items-center wwc:rounded-full wwc:border-2 wwc:border-transparent wwc:shadow-sm wwc:transition-colors wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:ring-offset-2 wwc:focus-visible:ring-offset-background wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50 wwc:data-[state=checked]:bg-primary wwc:data-[state=unchecked]:bg-input",
				size === "sm" ? "wwc:h-4 wwc:w-7" : "wwc:h-5 wwc:w-9",
				className,
			)}
			{...props}
			ref={ref}
		>
			<SwitchPrimitives.Thumb
				className={cn(
					"wwc:pointer-events-none wwc:block wwc:rounded-full wwc:bg-card wwc:shadow-lg wwc:ring-0 wwc:transition-transform wwc:data-[state=unchecked]:translate-x-0",
					// The thumb's travel is the track width minus its own width, so it moves with the size.
					size === "sm"
						? "wwc:h-3 wwc:w-3 wwc:data-[state=checked]:translate-x-3"
						: "wwc:h-4 wwc:w-4 wwc:data-[state=checked]:translate-x-4",
				)}
			/>
		</SwitchPrimitives.Root>
	),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export {Switch};
