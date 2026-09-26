/**
 * Avoid chevron for non-navigation actions.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function ChevronDont() {
	return (
		<ClickableCard className="wwc:w-[200px]" showChevron onClick={() => {}}>
			<div className="wwc:font-medium">Toggle Feature</div>
		</ClickableCard>
	);
}
