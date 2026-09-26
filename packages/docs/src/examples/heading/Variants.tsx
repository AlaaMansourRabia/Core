/**
 * Heading variants: default, muted, and accent.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function Variants() {
	return (
		<div className="wwc:space-y-2">
			<Heading level="h3" variant="default">Default heading</Heading>
			<Heading level="h3" variant="muted">Muted heading</Heading>
			<Heading level="h3" variant="accent">Accent heading</Heading>
		</div>
	);
}
