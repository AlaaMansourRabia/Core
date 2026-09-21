import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";

/** An interactive component that expands and collapses content. */
const Collapsible = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>((props, ref) => <CollapsiblePrimitive.Root ref={ref} {...props} />);
Collapsible.displayName = "Collapsible";
const CollapsibleTrigger: typeof CollapsiblePrimitive.CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent: typeof CollapsiblePrimitive.CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export {Collapsible, CollapsibleTrigger, CollapsibleContent};
