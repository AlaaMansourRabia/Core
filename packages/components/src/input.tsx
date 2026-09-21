import {cn} from "@core/core-utils";
import * as React from "react";

/** A form input field with consistent styling. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({className, type, ...props}, ref) => {
	return (
		<input
			type={type}
			className={cn(
				"wwc:flex wwc:h-9 wwc:w-full wwc:rounded-md wwc:border wwc:border-input wwc:bg-card wwc:px-3 wwc:py-1 wwc:text-base wwc:shadow-sm wwc:transition-colors wwc:file:border-0 wwc:file:bg-transparent wwc:file:text-sm wwc:file:font-medium wwc:file:text-foreground wwc:placeholder:text-muted-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:aria-invalid:border-destructive wwc:aria-invalid:focus-visible:ring-destructive wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50 wwc:md:text-sm",
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = "Input";

export {Input};
