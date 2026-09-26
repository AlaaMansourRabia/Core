/**
 * Avoid minimal or vague card content.
 */
import {SelectableCard} from "@corensystem/coren-ui/selectable-card";

export function ContentDont() {
	return (
		<SelectableCard className="wwc:w-[200px]" selected>
			<div className="wwc:text-sm">B</div>
		</SelectableCard>
	);
}
