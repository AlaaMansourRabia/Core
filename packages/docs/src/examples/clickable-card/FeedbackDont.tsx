/**
 * Avoid clickable cards without visual cues.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function FeedbackDont() {
	return (
		<ClickableCard className="wwc:w-[200px]" variant="ghost" onClick={() => {}}>
			<div className="wwc:text-sm">Subtle action</div>
		</ClickableCard>
	);
}
