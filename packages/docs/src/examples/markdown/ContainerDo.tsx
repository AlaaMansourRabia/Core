/**
 * Wrap user-generated content in Markdown for consistent styling.
 */
import {Markdown} from "@corensystem/coren-ui/markdown";

export function ContainerDo() {
	return (
		<article>
			<Markdown>
				<h2>User Post Title</h2>
				<p>User-generated content with proper prose styling.</p>
				<blockquote>Quoted text looks consistent.</blockquote>
			</Markdown>
		</article>
	);
}
