/**
 * All typography variants.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function Variants() {
	return (
		<div className="wwc:space-y-2">
			<Typography variant="h1">Display Large</Typography>
			<Typography variant="h2">Heading Medium</Typography>
			<Typography variant="h3">Heading Small</Typography>
			<Typography variant="h4">Subheading</Typography>
			<Typography variant="body">Regular body text for paragraphs.</Typography>
			<Typography variant="small">Small supporting text.</Typography>
			<Typography variant="caption">Caption or label text.</Typography>
		</div>
	);
}
