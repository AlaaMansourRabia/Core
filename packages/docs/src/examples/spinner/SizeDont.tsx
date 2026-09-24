/**
 * Avoid mismatched spinner and context sizes.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Spinner} from "@corensystem/coren-ui/spinner";

export function SizeDont() {
	return (
		<Button size="sm" disabled>
			<Spinner size="xl" className="wwc:mr-2" />
			Save
		</Button>
	);
}
