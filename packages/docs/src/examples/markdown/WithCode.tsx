/**
 * Markdown with code blocks and inline code.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function WithCode() {
	return (
		<Markdown>
			<h3>Code Example</h3>
			<p>
				Use the <code>useState</code> hook for local state:
			</p>
			<pre>
				<code>{`const [count, setCount] = useState(0);`}</code>
			</pre>
		</Markdown>
	);
}
