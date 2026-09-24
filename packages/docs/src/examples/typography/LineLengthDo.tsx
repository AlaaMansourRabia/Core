/**
 * Optimal line length for readability.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function LineLengthDo() {
	return (
		<div className="wwc:max-w-prose">
			<Typography variant="body">
				This paragraph has an optimal line length of around 65-75 characters per line,
				making it comfortable to read without losing your place.
			</Typography>
		</div>
	);
}
