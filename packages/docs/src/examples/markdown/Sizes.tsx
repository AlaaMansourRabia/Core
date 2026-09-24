/**
 * Markdown size variants for different contexts.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function Sizes() {
	return (
		<div className="wwc:space-y-6">
			<Markdown size="sm">
				<p>Small size text for compact areas.</p>
			</Markdown>
			<Markdown size="md">
				<p>Medium size text for standard content.</p>
			</Markdown>
			<Markdown size="lg">
				<p>Large size text for prominent content.</p>
			</Markdown>
		</div>
	);
}
