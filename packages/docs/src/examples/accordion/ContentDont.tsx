/**
 * Avoid using accordions for critical content users must see.
 */
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@corensystem/coren-ui/accordion";

export function ContentDont() {
	return (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="warning">
				<AccordionTrigger>Important Warning</AccordionTrigger>
				<AccordionContent>
					<p className="wwc:text-destructive wwc:font-medium">
						Critical safety information hidden in an accordion!
						Users might miss this important warning.
					</p>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
