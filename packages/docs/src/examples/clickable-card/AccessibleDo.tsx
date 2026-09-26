/**
 * Include descriptive content for screen readers.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";

export function AccessibleDo() {
	return (
		<ClickableCard className="wwc:w-[200px]" aria-label="Open settings page" onClick={() => {}}>
			<div className="wwc:font-medium">Settings</div>
			<div className="wwc:text-sm wwc:text-muted-foreground">Configure app</div>
		</ClickableCard>
	);
}
