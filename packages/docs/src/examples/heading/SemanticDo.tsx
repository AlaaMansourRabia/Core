/**
 * Use the 'as' prop when visual style differs from semantic level.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function SemanticDo() {
	return (
		<Heading level="h3" as="h2">
			Card Title
		</Heading>
	);
}
