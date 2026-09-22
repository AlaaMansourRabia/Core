import {cn} from "@corensystem/core-utils";
import * as React from "react";

/** A multi-line text input field. */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
	({className, ...props}, ref) => (
		<textarea
			className={cn(
				"wwc:flex wwc:min-h-[60px] wwc:w-full wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:px-3 wwc:py-2 wwc:text-base wwc:shadow-sm wwc:placeholder:text-muted-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50 wwc:md:text-sm",
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Textarea.displayName = "Textarea";

export {Textarea};
