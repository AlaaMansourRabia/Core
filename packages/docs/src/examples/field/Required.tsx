/**
 * Required field with indicator.
 */
import {Field, FieldLabel} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function Required() {
	return (
		<Field required>
			<FieldLabel>Full Name</FieldLabel>
			<Input placeholder="Enter your full name" />
		</Field>
	);
}
