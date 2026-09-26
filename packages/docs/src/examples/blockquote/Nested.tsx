/**
 * Nested blockquotes for quoted replies.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function Nested() {
	return (
		<Blockquote>
			<p>Someone asked me:</p>
			<Blockquote className="wwc:mt-2">What advice would you give to someone starting out?</Blockquote>
			<p className="wwc:mt-2">And I told them: Just start building. The best way to learn is by doing.</p>
		</Blockquote>
	);
}
