/**
 * Avoid using placeholder as the only label.
 */
import {Field} from "@corensystem/coren-ui/field";
import {Input} from "@corensystem/coren-ui/input";

export function PlaceholderDont() {
	return (
		<Field>
			{/* No label, relying only on placeholder */}
			<Input type="email" placeholder="Email" />
		</Field>
	);
}
