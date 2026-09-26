/**
 * Avoid using blockquotes for non-quoted content.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function SemanticsDont() {
	return (
		<div className="wwc:space-y-4">
			{/* Using blockquote for emphasis - semantically incorrect */}
			<Blockquote>Important: Remember to save your work frequently!</Blockquote>
			{/* Should use a callout or alert component instead */}
		</div>
	);
}
