/**
 * Use 'as' prop to override semantic tag while keeping visual style.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function WithAs() {
	return (
		<Heading level="h1" as="h2">
			Looks like h1, renders as h2
		</Heading>
	);
}
