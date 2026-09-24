/**
 * Basic form field with label.
 */
import {Field, FieldLabel, FieldInput} from "@corensystem/coren-ui/field";

export function Default() {
	return (
		<Field>
			<FieldLabel>Email</FieldLabel>
			<FieldInput type="email" placeholder="Enter your email" />
		</Field>
	);
}
