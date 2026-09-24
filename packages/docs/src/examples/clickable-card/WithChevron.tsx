/**
 * Clickable card with navigation chevron.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function WithChevron() {
	return (
		<ClickableCard className="wwc:w-[250px]" showChevron onClick={() => {}}>
			<div className="wwc:font-medium">Settings</div>
			<div className="wwc:text-sm wwc:text-muted-foreground">Manage your preferences</div>
		</ClickableCard>
	);
}
