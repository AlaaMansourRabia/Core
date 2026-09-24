/**
 * Avoid hiding selection indicator.
 */
import {SelectableCard} from "@corensystem/coren-ui/selectable-card";

export function FeedbackDont() {
	return (
		<SelectableCard className="wwc:w-[180px]" selected showCheckmark={false}>
			<div className="wwc:font-medium">Selected</div>
		</SelectableCard>
	);
}
