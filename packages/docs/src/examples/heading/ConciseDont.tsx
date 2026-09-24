/**
 * Avoid overly long heading text.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function ConciseDont() {
	return (
		<Heading level="h2">
			This is a very long heading that contains way too much information
		</Heading>
	);
}
