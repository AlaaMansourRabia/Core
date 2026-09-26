/**
 * Blockquote with citation/attribution.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function WithCitation() {
	return (
		<figure>
			<Blockquote>
				Design is not just what it looks like and feels like. Design is how it works.
			</Blockquote>
			<figcaption className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">
				— Steve Jobs
			</figcaption>
		</figure>
	);
}
