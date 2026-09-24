/**
 * Use descriptive, concise labels.
 */
import {Field, FieldLabel, FieldInput} from "@corensystem/coren-ui/field";

export function LabelsDo() {
	return (
		<div className="wwc:space-y-4">
			<Field>
				<FieldLabel>Email address</FieldLabel>
				<FieldInput type="email" />
			</Field>
			<Field>
				<FieldLabel>Phone number</FieldLabel>
				<FieldInput type="tel" />
			</Field>
		</div>
	);
}
