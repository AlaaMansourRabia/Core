/**
 * Avoid skipping heading levels.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function HierarchyDont() {
	return (
		<div className="wwc:space-y-2">
			<Heading level="h1">Page Title</Heading>
			<Heading level="h4">Section</Heading>
			<Heading level="h6">Subsection</Heading>
		</div>
	);
}
