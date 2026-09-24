/**
 * Required field with indicator.
 */
import {Field, FieldLabel, FieldInput} from "@corensystem/coren-ui/field";

export function Required() {
	return (
		<Field required>
			<FieldLabel>Full Name</FieldLabel>
			<FieldInput placeholder="Enter your full name" />
		</Field>
	);
}
