/**
 * Avoid using inline code for multi-line snippets.
 */
import {Code} from "@corensystem/coren-ui/code";

export function InlineDont() {
	return <Code>{"const x = 1;\nconst y = 2;\nconst z = x + y;"}</Code>;
}
