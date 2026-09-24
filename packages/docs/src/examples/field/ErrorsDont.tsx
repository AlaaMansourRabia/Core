/**
 * Avoid generic error messages.
 */
import {Field, FieldLabel, FieldInput, FieldError} from "@corensystem/coren-ui/field";

export function ErrorsDont() {
	return (
		<Field invalid>
			<FieldLabel>Password</FieldLabel>
			<FieldInput type="password" defaultValue="abc" />
			<FieldError>Invalid input</FieldError>
		</Field>
	);
}
