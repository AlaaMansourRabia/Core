import {cn} from "@corensystem/coren-utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import {useDialogContainer} from "./dialog";

/** Displays rich content in a portal, triggered by a button. */
function Popover(props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root {...props} />;
}
const PopoverTrigger: typeof PopoverPrimitive.Trigger = PopoverPrimitive.Trigger;
const PopoverAnchor: typeof PopoverPrimitive.Anchor = PopoverPrimitive.Anchor;

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
	/**
	 * Where the popover is portalled. Defaults to the enclosing `DialogContent` when there is one and
	 * `document.body` otherwise — see {@link useDialogContainer} for why the dialog case differs.
	 * Pass an element to override that, or `null` to force `document.body` inside a dialog.
	 */
	container?: HTMLElement | null;
}

const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
	({className, align = "start", sideOffset = 4, container, ...props}, ref) => {
		const dialogContainer = useDialogContainer();
		// `undefined` means "not specified" and falls back to the dialog; `null` is an explicit opt-out.
		const target = container === undefined ? dialogContainer : container;
		return (
			<PopoverPrimitive.Portal container={target ?? undefined}>
				<PopoverPrimitive.Content
					ref={ref}
					align={align}
					sideOffset={sideOffset}
					className={cn(
						"wwc:z-50 wwc:w-72 wwc:rounded-md wwc:border wwc:bg-popover wwc:p-4 wwc:text-popover-foreground wwc:shadow-md wwc:outline-none wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
						className,
					)}
					{...props}
				/>
			</PopoverPrimitive.Portal>
		);
	},
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export {Popover, PopoverTrigger, PopoverContent, PopoverAnchor};
