/**
 * Accordion used for FAQ content.
 */
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@corensystem/coren-ui/accordion";

export function FAQ() {
	return (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="q1">
				<AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
				<AccordionContent>We accept all major credit cards, PayPal, and bank transfers.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="q2">
				<AccordionTrigger>How long does shipping take?</AccordionTrigger>
				<AccordionContent>
					Standard shipping takes 5-7 business days. Express shipping is available for 2-3 day delivery.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="q3">
				<AccordionTrigger>What is your return policy?</AccordionTrigger>
				<AccordionContent>We offer a 30-day return policy for unused items in original packaging.</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
