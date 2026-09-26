/**
 * Use placeholders for examples, not labels.
 */
import {Field, FieldLabel} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function PlaceholderDo() {
	return (
		<Field>
			<FieldLabel>Email</FieldLabel>
			<Input type="email" placeholder="name@example.com" />
		</Field>
	);
}
