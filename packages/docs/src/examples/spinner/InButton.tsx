/**
 * Spinner inside a button to indicate loading state.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Spinner} from "@corensystem/coren-ui/spinner";

export function InButton() {
	return (
		<Button disabled>
			<Spinner size="sm" className="wwc:mr-2" />
			Loading...
		</Button>
	);
}
