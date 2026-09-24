/**
 * Use accordions for progressive disclosure of related content.
 */
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@corensystem/coren-ui/accordion";

export function ContentDo() {
	return (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="basic">
				<AccordionTrigger>Basic Information</AccordionTrigger>
				<AccordionContent>
					Name, email, and contact details.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="advanced">
				<AccordionTrigger>Advanced Settings</AccordionTrigger>
				<AccordionContent>
					API keys, webhooks, and integrations.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="danger">
				<AccordionTrigger>Danger Zone</AccordionTrigger>
				<AccordionContent>
					Delete account and data export options.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
