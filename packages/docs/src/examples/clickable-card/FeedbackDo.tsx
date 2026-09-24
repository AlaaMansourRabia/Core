/**
 * Provide clear visual feedback on hover.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function FeedbackDo() {
	return (
		<ClickableCard className="wwc:w-[200px]" onClick={() => {}}>
			<div className="wwc:font-medium">Interactive</div>
		</ClickableCard>
	);
}
