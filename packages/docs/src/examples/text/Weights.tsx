/**
 * Text weight options for emphasis.
 */
import {Text} from "@corensystem/coren-ui/text";

export function Weights() {
	return (
		<div className="wwc:space-y-2">
			<Text weight="normal">Normal weight</Text>
			<Text weight="medium">Medium weight</Text>
			<Text weight="semibold">Semibold weight</Text>
			<Text weight="bold">Bold weight</Text>
		</div>
	);
}
