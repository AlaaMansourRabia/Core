/**
 * Avoid using headings purely for styling text.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function SemanticDont() {
	return <Heading level="h1">This is just bold text, not a heading</Heading>;
}
