/**
 * Avoid overly verbose or unclear labels.
 */
import {Field, FieldLabel, FieldInput} from "@corensystem/coren-ui/field";

export function LabelsDont() {
	return (
		<div className="wwc:space-y-4">
			<Field>
				<FieldLabel>Please enter your email address here</FieldLabel>
				<FieldInput type="email" />
			</Field>
			<Field>
				<FieldLabel>Input 2</FieldLabel>
				<FieldInput type="tel" />
			</Field>
		</div>
	);
}
