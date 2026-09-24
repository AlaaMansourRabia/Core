/**
 * Field with helper description.
 */
import {Field, FieldLabel, FieldInput, FieldDescription} from "@corensystem/coren-ui/field";

export function WithDescription() {
	return (
		<Field>
			<FieldLabel>Password</FieldLabel>
			<FieldInput type="password" placeholder="Enter password" />
			<FieldDescription>Must be at least 8 characters</FieldDescription>
		</Field>
	);
}
