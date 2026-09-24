import {cn} from "@corensystem/coren-utils";
import * as React from "react";

/** Groups an input with addons like icons, buttons, or text. */
const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => <div ref={ref} className={cn("wwc:flex wwc:items-center", className)} {...props} />,
);
InputGroup.displayName = "InputGroup";

const InputGroupText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
	({className, ...props}, ref) => (
		<span
			ref={ref}
			className={cn(
				"wwc:flex wwc:h-9 wwc:items-center wwc:justify-center wwc:border wwc:border-input wwc:bg-muted wwc:px-3 wwc:text-sm wwc:text-muted-foreground wwc:first:rounded-l-md wwc:first:border-r-0 wwc:last:rounded-r-md wwc:last:border-l-0",
				className,
			)}
			{...props}
		/>
	),
);
InputGroupText.displayName = "InputGroupText";

export {InputGroup, InputGroupText};
