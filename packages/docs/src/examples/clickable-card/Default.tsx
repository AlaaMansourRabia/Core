/**
 * A basic clickable card.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function Default() {
	return (
		<ClickableCard className="wwc:w-[250px]" onClick={() => {}}>
			<div className="wwc:font-medium">Card Title</div>
			<div className="wwc:text-sm wwc:text-muted-foreground">Click to view details</div>
		</ClickableCard>
	);
}
