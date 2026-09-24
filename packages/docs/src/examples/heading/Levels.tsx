/**
 * All heading levels from h1 to h6.
 */
import {Heading} from "@corensystem/coren-ui/heading";

export function Levels() {
	return (
		<div className="wwc:space-y-2">
			<Heading level="h1">Heading 1</Heading>
			<Heading level="h2">Heading 2</Heading>
			<Heading level="h3">Heading 3</Heading>
			<Heading level="h4">Heading 4</Heading>
			<Heading level="h5">Heading 5</Heading>
			<Heading level="h6">Heading 6</Heading>
		</div>
	);
}
