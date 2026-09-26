/**
 * Selectable cards with different checkmark positions.
 */
import {SelectableCard} from "@corensystem/coren-ui/selectable-card";

export function CheckmarkPosition() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<SelectableCard className="wwc:w-[120px] wwc:h-[100px]" selected checkmarkPosition="top-left">
				<div className="wwc:text-sm">Top Left</div>
			</SelectableCard>
			<SelectableCard className="wwc:w-[120px] wwc:h-[100px]" selected checkmarkPosition="top-right">
				<div className="wwc:text-sm">Top Right</div>
			</SelectableCard>
		</div>
	);
}
