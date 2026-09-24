/**
 * Use proper heading hierarchy for structured content.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function SemanticDo() {
	return (
		<Markdown>
			<h2>Main Section</h2>
			<p>Introduction paragraph.</p>
			<h3>Subsection</h3>
			<p>Subsection content.</p>
			<h4>Detail</h4>
			<p>Detailed information.</p>
		</Markdown>
	);
}
