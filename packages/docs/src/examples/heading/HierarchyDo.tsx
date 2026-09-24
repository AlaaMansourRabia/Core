/**
 * Maintain proper heading hierarchy for accessibility.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function HierarchyDo() {
	return (
		<div className="wwc:space-y-2">
			<Heading level="h1">Page Title</Heading>
			<Heading level="h2">Section</Heading>
			<Heading level="h3">Subsection</Heading>
		</div>
	);
}
