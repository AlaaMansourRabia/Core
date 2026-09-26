/**
 * Use blockquotes for actual quotations.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function SemanticsDo() {
	return (
		<article>
			<p className="wwc:mb-4 wwc:text-sm">In her famous essay, Virginia Woolf wrote:</p>
			<Blockquote>A woman must have money and a room of her own if she is to write fiction.</Blockquote>
		</article>
	);
}
