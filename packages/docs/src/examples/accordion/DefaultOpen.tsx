/**
 * Accordion with a default open section.
 */
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@corensystem/coren-ui/accordion";

export function DefaultOpen() {
	return (
		<Accordion type="single" defaultValue="item-2" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>First Section</AccordionTrigger>
				<AccordionContent>First section content.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Second Section (Open by default)</AccordionTrigger>
				<AccordionContent>
					This section is open when the page loads.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Third Section</AccordionTrigger>
				<AccordionContent>Third section content.</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
