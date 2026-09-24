/**
 * Avoid using placeholder as the only label.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";

export function PlaceholderDont() {
	return (
		<div className="wwc:max-w-md">
			<Textarea placeholder="Feedback" />
		</div>
	);
}
