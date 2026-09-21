import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {cn} from "@wakecap/core-utils";
import {Check, Minus} from "lucide-react";
import * as React from "react";

/** A control that allows the user to toggle between checked and not checked. */
const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({className, checked, ...props}, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		checked={checked}
		className={cn(
			"wwc:peer wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:rounded-[var(--radius-control)] wwc:border wwc:border-primary wwc:shadow wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50 wwc:data-[state=checked]:bg-primary wwc:data-[state=checked]:text-primary-foreground wwc:data-[state=indeterminate]:bg-primary wwc:data-[state=indeterminate]:text-primary-foreground",
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator className={cn("wwc:flex wwc:items-center wwc:justify-center wwc:text-current")}>
			{checked === "indeterminate" ? <Minus className="wwc:h-4 wwc:w-4" /> : <Check className="wwc:h-4 wwc:w-4" />}
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export {Checkbox};
