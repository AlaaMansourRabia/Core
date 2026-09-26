/**
 * Use clear visual styling for quotes.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function StylingDo() {
	return (
		<div className="wwc:space-y-4 wwc:text-sm">
			<p>Here's what our customers are saying:</p>
			<Blockquote>This product completely changed how we work. I can't imagine going back.</Blockquote>
			<p>Join thousands of satisfied users today.</p>
		</div>
	);
}
