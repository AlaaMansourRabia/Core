/**
 * Use proper heading hierarchy.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function HierarchyDo() {
	return (
		<article>
			<Typography variant="h1">Main Page Title</Typography>
			<Typography variant="h2">Section Heading</Typography>
			<Typography variant="body">Section content goes here.</Typography>
			<Typography variant="h3">Subsection</Typography>
			<Typography variant="body">More detailed content.</Typography>
		</article>
	);
}
