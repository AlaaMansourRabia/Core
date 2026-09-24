/**
 * Avoid rendering rich content without prose styling.
 */
export function ContainerDont() {
	return (
		<article>
			<h2>User Post Title</h2>
			<p>Raw HTML without prose styling looks inconsistent.</p>
			<blockquote>Blockquotes have no styling.</blockquote>
		</article>
	);
}
