/**
 * Clickable card as a navigation link.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function AsLink() {
	return (
		<ClickableCard className="wwc:w-[250px]" href="#" showChevron>
			<div className="wwc:font-medium">Documentation</div>
			<div className="wwc:text-sm wwc:text-muted-foreground">Read the docs</div>
		</ClickableCard>
	);
}
