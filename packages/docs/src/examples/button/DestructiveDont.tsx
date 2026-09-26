/**
 * Avoid destructive styling for non-destructive actions.
 */
import {Button} from "@corensystem/coren-ui/button";

export function DestructiveDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm">Go to settings</span>
				<Button variant="destructive" size="sm">
					Settings
				</Button>
			</div>
		</div>
	);
}
