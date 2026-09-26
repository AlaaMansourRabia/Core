/**
 * Use CodeBlock for multi-line code examples.
 */
import {CodeBlock} from "@corensystem/coren-ui/code";

export function BlockDo() {
	return (
		<CodeBlock className="wwc:max-w-[300px]">
{`const sum = (a, b) => {
  return a + b;
};`}
		</CodeBlock>
	);
}
