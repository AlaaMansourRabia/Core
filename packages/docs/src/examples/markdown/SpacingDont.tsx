/**
 * Avoid default spacing in compact UI areas.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function SpacingDont() {
	return (
		<aside className="wwc:w-64 wwc:border wwc:rounded wwc:p-3">
			<Markdown>
				<h4>Related Links</h4>
				<ul>
					<li>Documentation</li>
					<li>API Reference</li>
					<li>Examples</li>
				</ul>
			</Markdown>
		</aside>
	);
}
