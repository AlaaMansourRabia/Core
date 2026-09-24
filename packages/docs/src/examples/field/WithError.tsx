/**
 * Field with error message.
 */
import {Field, FieldLabel, FieldInput, FieldError} from "@corensystem/coren-ui/field";

export function WithError() {
	return (
		<Field invalid>
			<FieldLabel>Username</FieldLabel>
			<FieldInput defaultValue="ab" />
			<FieldError>Username must be at least 3 characters</FieldError>
		</Field>
	);
}
