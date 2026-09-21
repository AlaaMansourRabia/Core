import * as TogglePrimitive from "@radix-ui/react-toggle";
import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const toggleVariants = cva(
	"wwc:inline-flex wwc:items-center wwc:justify-center wwc:rounded-md wwc:text-sm wwc:font-medium wwc:transition-colors wwc:hover:bg-muted wwc:hover:text-muted-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:pointer-events-none wwc:disabled:opacity-50 wwc:data-[state=on]:bg-accent wwc:data-[state=on]:text-accent-foreground",
	{
		variants: {
			variant: {
				default: "wwc:bg-transparent",
				outline:
					"wwc:border wwc:border-input wwc:bg-transparent wwc:shadow-sm wwc:hover:bg-accent wwc:hover:text-accent-foreground",
			},
			size: {
				default: "wwc:h-9 wwc:px-3",
				sm: "wwc:h-8 wwc:px-2",
				lg: "wwc:h-10 wwc:px-3",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

/** A two-state button that can be toggled on or off. */
const Toggle = React.forwardRef<
	React.ElementRef<typeof TogglePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({className, variant, size, ...props}, ref) => (
	<TogglePrimitive.Root ref={ref} className={cn(toggleVariants({variant, size, className}))} {...props} />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export {Toggle, toggleVariants};
