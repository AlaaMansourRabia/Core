/**
 * Show specific, actionable errors.
 */
import {Field, FieldLabel, FieldInput, FieldError} from "@corensystem/coren-ui/field";

export function ErrorsDo() {
	return (
		<Field invalid>
			<FieldLabel>Password</FieldLabel>
			<FieldInput type="password" defaultValue="abc" />
			<FieldError>Password must be at least 8 characters and include a number</FieldError>
		</Field>
	);
}
