/**
 * Reserve destructive styling for irreversible actions.
 */
import {Button} from "@corensystem/coren-ui/button";

export function DestructiveDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm">Permanently delete account?</span>
				<Button variant="destructive" size="sm">
					Delete
				</Button>
			</div>
		</div>
	);
}
