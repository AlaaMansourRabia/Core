/**
 * Avoid skipping heading levels.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function HierarchyDont() {
	return (
		<article>
			<Typography variant="h1">Main Title</Typography>
			{/* Skipped h2, jumped to h4 */}
			<Typography variant="h4">Section</Typography>
			<Typography variant="body">Content.</Typography>
		</article>
	);
}
