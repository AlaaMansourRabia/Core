/**
 * Include descriptive content in selectable cards.
 */
import {SelectableCard} from "@corensystem/coren-ui/selectable-card";

export function ContentDo() {
	return (
		<SelectableCard className="wwc:w-[200px]" selected>
			<div className="wwc:font-medium">Pro Plan</div>
			<div className="wwc:text-sm wwc:text-muted-foreground">$29/month</div>
		</SelectableCard>
	);
}
