/**
 * Avoid CodeBlock for single short statements.
 */
import {CodeBlock} from "@corensystem/coren-ui/code";

export function BlockDont() {
	return <CodeBlock className="wwc:max-w-[300px]">npm install</CodeBlock>;
}
