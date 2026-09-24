/**
 * Typography with font weights.
 */
import {Typography} from "@corensystem/coren-ui/typography";

export function WithWeight() {
	return (
		<div className="wwc:space-y-2">
			<Typography weight="light">Light weight text</Typography>
			<Typography weight="regular">Regular weight text</Typography>
			<Typography weight="medium">Medium weight text</Typography>
			<Typography weight="semibold">Semibold weight text</Typography>
			<Typography weight="bold">Bold weight text</Typography>
		</div>
	);
}
