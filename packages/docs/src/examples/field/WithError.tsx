/**
 * Field with error message.
 */
import {Field, FieldLabel, FieldError} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function WithError() {
	return (
		<Field invalid>
			<FieldLabel>Username</FieldLabel>
			<Input defaultValue="ab" />
			<FieldError>Username must be at least 3 characters</FieldError>
		</Field>
	);
}
