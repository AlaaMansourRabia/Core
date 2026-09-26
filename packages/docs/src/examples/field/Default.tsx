/**
 * Basic form field with label.
 */
import {Field, FieldLabel} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function Default() {
	return (
		<Field>
			<FieldLabel>Email</FieldLabel>
			<Input type="email" placeholder="Enter your email" />
		</Field>
	);
}
