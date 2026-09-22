import {cn} from "@corensystem/core-utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import {Circle} from "lucide-react";
import * as React from "react";

/** A set of checkable buttons where only one can be checked at a time. */
const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({className, ...props}, ref) => (
	<RadioGroupPrimitive.Root className={cn("wwc:grid wwc:gap-2", className)} {...props} ref={ref} />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({className, ...props}, ref) => (
	<RadioGroupPrimitive.Item
		ref={ref}
		className={cn(
			"wwc:aspect-square wwc:h-4 wwc:w-4 wwc:rounded-full wwc:border wwc:border-primary wwc:text-primary wwc:shadow wwc:focus:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50",
			className,
		)}
		{...props}
	>
		<RadioGroupPrimitive.Indicator className="wwc:flex wwc:items-center wwc:justify-center">
			{/* Dot sits inside a 16px item — 10px leaves a visible ring rather than filling it. */}
			<Circle className="wwc:h-2.5 wwc:w-2.5 wwc:fill-primary wwc:text-primary" />
		</RadioGroupPrimitive.Indicator>
	</RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export {RadioGroup, RadioGroupItem};
