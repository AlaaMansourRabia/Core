/**
 * Avoid using code styling for non-code content.
 */
import {Code} from "@corensystem/coren-ui/code";

export function SemanticDont() {
	return (
		<p className="wwc:text-sm">
			Click the <Code>Submit</Code> button.
		</p>
	);
}
