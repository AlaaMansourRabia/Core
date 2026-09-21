import * as LabelPrimitive from "@radix-ui/react-label";
import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const labelVariants = cva(
	"wwc:text-sm wwc:font-medium wwc:leading-none wwc:peer-disabled:cursor-not-allowed wwc:peer-disabled:opacity-70",
);

export interface LabelProps
	extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>, VariantProps<typeof labelVariants> {
	/**
	 * Append a required-field asterisk after the label text. The asterisk is decorative
	 * (`aria-hidden`) — also mark the control itself `required` so assistive tech is told.
	 */
	required?: boolean;
}

/** Decorative required-field asterisk. The control carries the actual semantics. */
function RequiredMark() {
	return (
		<span aria-hidden="true" className="wwc:ml-0.5 wwc:text-destructive">
			*
		</span>
	);
}

/** Renders an accessible label associated with form controls. */
const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
	({className, required = false, children, ...props}, ref) => (
		<LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props}>
			{children}
			{required && <RequiredMark />}
		</LabelPrimitive.Root>
	),
);
Label.displayName = LabelPrimitive.Root.displayName;

export {Label, RequiredMark};
