/**
 * Ensure readable contrast.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function ContrastDo() {
	return (
		<div className="wwc:space-y-2">
			<Typography variant="h2" color="default">High contrast heading</Typography>
			<Typography variant="body" color="default">Readable body text.</Typography>
			<Typography variant="small" color="muted">Supporting muted text.</Typography>
		</div>
	);
}
