/**
 * Blockquote for longer passages.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function Long() {
	return (
		<Blockquote>
			<p>
				It is a truth universally acknowledged, that a single man in possession of
				a good fortune, must be in want of a wife.
			</p>
			<p className="wwc:mt-2">
				However little known the feelings or views of such a man may be on his
				first entering a neighbourhood, this truth is so well fixed in the minds
				of the surrounding families, that he is considered as the rightful
				property of some one or other of their daughters.
			</p>
		</Blockquote>
	);
}
