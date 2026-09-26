/**
 * Use descriptive, scannable accordion titles.
 */
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@corensystem/coren-ui/accordion";

export function TitlesDo() {
	return (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Account Settings</AccordionTrigger>
				<AccordionContent>Manage your account preferences.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Privacy Controls</AccordionTrigger>
				<AccordionContent>Control your privacy settings.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Notification Preferences</AccordionTrigger>
				<AccordionContent>Choose how you receive notifications.</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
