/**
 * Match spinner size to the context.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Spinner} from "@corensystem/coren-ui/spinner";

export function SizeDo() {
	return (
		<Button size="sm" disabled>
			<Spinner size="sm" className="wwc:mr-2" />
			Save
		</Button>
	);
}
