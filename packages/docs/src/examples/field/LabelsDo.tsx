/**
 * Use descriptive, concise labels.
 */
import {Field, FieldLabel} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function LabelsDo() {
	return (
		<div className="wwc:space-y-4">
			<Field>
				<FieldLabel>Email address</FieldLabel>
				<Input type="email" />
			</Field>
			<Field>
				<FieldLabel>Phone number</FieldLabel>
				<Input type="tel" />
			</Field>
		</div>
	);
}
