/**
 * Show specific, actionable errors.
 */
import {Field, FieldLabel, FieldError} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function ErrorsDo() {
	return (
		<Field invalid>
			<FieldLabel>Password</FieldLabel>
			<Input type="password" defaultValue="abc" />
			<FieldError>Password must be at least 8 characters and include a number</FieldError>
		</Field>
	);
}
