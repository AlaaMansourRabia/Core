/**
 * Avoid generic error messages.
 */
import {Field, FieldLabel, FieldError} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function ErrorsDont() {
	return (
		<Field invalid>
			<FieldLabel>Password</FieldLabel>
			<Input type="password" defaultValue="abc" />
			<FieldError>Invalid input</FieldError>
		</Field>
	);
}
