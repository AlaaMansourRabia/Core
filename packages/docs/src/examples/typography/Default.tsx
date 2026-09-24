/**
 * Basic typography styles.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function Default() {
	return (
		<div className="wwc:space-y-4">
			<Typography variant="h1">Heading 1</Typography>
			<Typography variant="h2">Heading 2</Typography>
			<Typography variant="h3">Heading 3</Typography>
			<Typography variant="body">Body text</Typography>
			<Typography variant="small">Small text</Typography>
		</div>
	);
}
