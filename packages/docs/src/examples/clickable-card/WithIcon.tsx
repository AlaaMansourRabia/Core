/**
 * Clickable card with left slot icon.
 */
import {ClickableCard} from "@corensystem/coren-ui/clickable-card";
import {Bell} from "lucide-react";

export function WithIcon() {
	return (
		<ClickableCard
			className="wwc:w-[250px]"
			leftSlot={<Bell className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />}
			showChevron
			onClick={() => {}}
		>
			<div className="wwc:font-medium">Notifications</div>
			<div className="wwc:text-sm wwc:text-muted-foreground">3 unread messages</div>
		</ClickableCard>
	);
}
