/**
 * Avoid overly verbose or unclear labels.
 */
import {Field, FieldLabel} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function LabelsDont() {
	return (
		<div className="wwc:space-y-4">
			<Field>
				<FieldLabel>Please enter your email address here</FieldLabel>
				<Input type="email" />
			</Field>
			<Field>
				<FieldLabel>Input 2</FieldLabel>
				<Input type="tel" />
			</Field>
		</div>
	);
}
