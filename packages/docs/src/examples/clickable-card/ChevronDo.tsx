/**
 * Use chevron for navigation actions.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function ChevronDo() {
	return (
		<ClickableCard className="wwc:w-[200px]" showChevron href="#">
			<div className="wwc:font-medium">View Profile</div>
		</ClickableCard>
	);
}
