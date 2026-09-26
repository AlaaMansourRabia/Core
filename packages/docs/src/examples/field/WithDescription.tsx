/**
 * Field with helper description.
 */
import {Field, FieldLabel, FieldDescription} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function WithDescription() {
	return (
		<Field>
			<FieldLabel>Password</FieldLabel>
			<Input type="password" placeholder="Enter password" />
			<FieldDescription>Must be at least 8 characters</FieldDescription>
		</Field>
	);
}
