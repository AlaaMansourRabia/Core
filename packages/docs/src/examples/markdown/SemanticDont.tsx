/**
 * Avoid skipping heading levels or using headings for styling.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function SemanticDont() {
	return (
		<Markdown>
			<h2>Main Section</h2>
			<h5>Skipped to H5 for smaller text</h5>
			<p>This breaks document structure.</p>
		</Markdown>
	);
}
