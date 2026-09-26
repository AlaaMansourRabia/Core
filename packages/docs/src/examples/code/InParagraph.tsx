/**
 * Inline code naturally flows within paragraph text.
 */
import {Code} from "@corensystem/coren-ui/code";

export function InParagraph() {
	return (
		<p className="wwc:text-sm wwc:max-w-[400px]">
			The <Code>useState</Code> hook returns an array with the current state value and a <Code>setState</Code> function.
		</p>
	);
}
