/**
 * Avoid low contrast text.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function ContrastDont() {
	return (
		<div className="wwc:space-y-2 wwc:text-gray-300">
			<Typography variant="h2">Low contrast heading</Typography>
			<Typography variant="body">Hard to read body text.</Typography>
		</div>
	);
}
