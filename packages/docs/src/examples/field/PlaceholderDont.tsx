/**
 * Avoid using placeholder as the only label.
 */
import {Field, FieldInput} from "@corensystem/coren-ui/field";

export function PlaceholderDont() {
	return (
		<Field>
			{/* No label, relying only on placeholder */}
			<FieldInput type="email" placeholder="Email" />
		</Field>
	);
}
