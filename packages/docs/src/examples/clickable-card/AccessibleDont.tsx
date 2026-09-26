/**
 * Avoid cards with only visual content.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function AccessibleDont() {
	return (
		<ClickableCard className="wwc:w-[200px]" onClick={() => {}}>
			<div className="wwc:h-8 wwc:w-8 wwc:rounded wwc:bg-muted" />
		</ClickableCard>
	);
}
