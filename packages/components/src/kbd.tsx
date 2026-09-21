import {cn} from "@core/core-utils";
import * as React from "react";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

/** Displays a keyboard key or shortcut indicator. */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(({className, ...props}, ref) => (
	<kbd
		ref={ref}
		className={cn(
			"wwc:pointer-events-none wwc:inline-flex wwc:h-5 wwc:select-none wwc:items-center wwc:gap-1 wwc:rounded wwc:border wwc:bg-muted wwc:px-1.5 wwc:font-mono wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground",
			className,
		)}
		{...props}
	/>
));
Kbd.displayName = "Kbd";

export {Kbd};
