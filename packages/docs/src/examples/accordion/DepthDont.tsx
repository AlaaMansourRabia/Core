/**
 * Avoid deeply nested accordions.
 */
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@corensystem/coren-ui/accordion";

export function DepthDont() {
	return (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Outer Level</AccordionTrigger>
				<AccordionContent>
					<Accordion type="single" collapsible>
						<AccordionItem value="nested-1">
							<AccordionTrigger>Nested Level</AccordionTrigger>
							<AccordionContent>
								Nested accordions are confusing and hard to navigate.
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
