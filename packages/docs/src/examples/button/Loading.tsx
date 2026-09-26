/**
 * Loading state with spinner indicator.
 */
import {Button} from "@corensystem/coren-ui/button";

export function Loading() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Button loading>Saving...</Button>
			<Button loading variant="secondary">
				Processing
			</Button>
		</div>
	);
}
