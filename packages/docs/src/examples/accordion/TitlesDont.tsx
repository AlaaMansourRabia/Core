/**
 * Avoid vague or overly long accordion titles.
 */
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@corensystem/coren-ui/accordion";

export function TitlesDont() {
	return (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Section 1</AccordionTrigger>
				<AccordionContent>What is Section 1 about?</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>
					Click here to expand this section and view more information about various topics
				</AccordionTrigger>
				<AccordionContent>Too long a title.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Misc</AccordionTrigger>
				<AccordionContent>Unclear what this contains.</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
