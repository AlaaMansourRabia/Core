/**
 * Disabled button states.
 */
import {Button} from "@corensystem/coren-ui/button";

export function Disabled() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Button disabled>Disabled</Button>
			<Button disabled variant="secondary">
				Disabled
			</Button>
			<Button disabled variant="outline">
				Disabled
			</Button>
		</div>
	);
}
