/**
 * Avoid very long lines.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function LineLengthDont() {
	return (
		<div className="wwc:w-full">
			<Typography variant="body">
				This paragraph spans the full width of the container which can make it very difficult to read because your eye has to travel a long distance to get to the next line and you might lose your place in the text which reduces comprehension and causes eye strain.
			</Typography>
		</div>
	);
}
