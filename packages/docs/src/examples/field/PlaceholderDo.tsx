/**
 * Use placeholders for examples, not labels.
 */
import {Field, FieldLabel, FieldInput} from "@corensystem/coren-ui/field";

export function PlaceholderDo() {
	return (
		<Field>
			<FieldLabel>Email</FieldLabel>
			<FieldInput type="email" placeholder="name@example.com" />
		</Field>
	);
}
