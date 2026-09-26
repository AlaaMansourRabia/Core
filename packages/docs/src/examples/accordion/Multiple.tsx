/**
 * Accordion allowing multiple panels open simultaneously.
 */
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@corensystem/coren-ui/accordion";

export function Multiple() {
	return (
		<Accordion type="multiple" className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Section One</AccordionTrigger>
				<AccordionContent>Content for section one. Multiple sections can be open.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Section Two</AccordionTrigger>
				<AccordionContent>Content for section two. Try opening both!</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Section Three</AccordionTrigger>
				<AccordionContent>Content for section three.</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
