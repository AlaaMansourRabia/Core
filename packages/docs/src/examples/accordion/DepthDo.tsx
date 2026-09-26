/**
 * Keep accordion hierarchy flat - one level only.
 */
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@corensystem/coren-ui/accordion";

export function DepthDo() {
	return (
		<Accordion type="single" collapsible className="wwc:w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>Getting Started</AccordionTrigger>
				<AccordionContent>
					<ul className="wwc:list-disc wwc:pl-4 wwc:space-y-1">
						<li>Installation guide</li>
						<li>Quick start tutorial</li>
						<li>Configuration options</li>
					</ul>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>API Reference</AccordionTrigger>
				<AccordionContent>
					<ul className="wwc:list-disc wwc:pl-4 wwc:space-y-1">
						<li>Methods</li>
						<li>Properties</li>
						<li>Events</li>
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
