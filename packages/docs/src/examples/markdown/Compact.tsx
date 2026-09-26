/**
 * Compact mode with reduced spacing for dense content.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function Compact() {
	return (
		<Markdown compact>
			<h3>Quick Notes</h3>
			<p>This content uses compact spacing.</p>
			<p>Ideal for sidebars or smaller areas.</p>
		</Markdown>
	);
}
