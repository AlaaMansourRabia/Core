import {cn} from "@wakecap/core-utils";
import * as React from "react";

import {Label} from "./label";

/** Compound component for form field layout combining label, input, description, and error. */
const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:space-y-2", className)} {...props} />
));
Field.displayName = "Field";

const FieldLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
	({className, ...props}, ref) => <Label ref={ref} className={cn(className)} {...props} />,
);
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
	),
);
FieldDescription.displayName = "FieldDescription";

const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<p ref={ref} className={cn("wwc:text-sm wwc:font-medium wwc:text-destructive", className)} {...props} />
	),
);
FieldError.displayName = "FieldError";

export {Field, FieldLabel, FieldDescription, FieldError};
