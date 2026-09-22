import {cn} from "@corensystem/core-utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {ChevronDown} from "lucide-react";
import * as React from "react";

/** A vertically stacked set of interactive headings that each reveal a section of content. */
const Accordion = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>((props, ref) => <AccordionPrimitive.Root ref={ref} {...props} />);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({className, ...props}, ref) => (
	<AccordionPrimitive.Item ref={ref} className={cn("wwc:border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({className, children, ...props}, ref) => (
	// min-w-0 on BOTH the header and the trigger: a flex item defaults to min-width:auto, so a long
	// label refuses to shrink, pushes the chevron out of the row and overflows the panel. With it,
	// a consumer's `truncate` actually truncates.
	<AccordionPrimitive.Header className="wwc:flex wwc:min-w-0">
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				"wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:justify-between wwc:gap-2 wwc:py-4 wwc:text-sm wwc:font-medium wwc:transition-all wwc:hover:underline wwc:[&[data-state=open]>svg]:rotate-180",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronDown className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground wwc:transition-transform wwc:duration-200" />
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({className, children, ...props}, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		className="wwc:overflow-hidden wwc:text-sm wwc:data-[state=closed]:animate-accordion-up wwc:data-[state=open]:animate-accordion-down"
		{...props}
	>
		<div className={cn("wwc:pb-4 wwc:pt-0", className)}>{children}</div>
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {Accordion, AccordionItem, AccordionTrigger, AccordionContent};
