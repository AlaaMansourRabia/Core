/**
 * Choose compact mode for space-constrained areas.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function SpacingDo() {
	return (
		<aside className="wwc:w-64 wwc:border wwc:rounded wwc:p-3">
			<Markdown compact>
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
