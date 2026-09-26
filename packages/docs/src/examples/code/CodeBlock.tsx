/**
 * Multi-line code block for larger snippets.
 */
import {CodeBlock} from "@corensystem/coren-ui/code";

export function CodeBlockExample() {
	return (
		<CodeBlock className="wwc:max-w-[400px]">
			{`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
		</CodeBlock>
	);
}
