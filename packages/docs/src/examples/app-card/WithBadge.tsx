/**
 * App card with notification badge.
 */
import {AppCard, AppCardIcon, AppCardTitle, AppCardBadge} from "@corensystem/coren-ui/app-card";
import {Bell} from "lucide-react";

export function WithBadge() {
	return (
		<AppCard className="wwc:w-48">
			<AppCardIcon>
				<Bell className="wwc:h-8 wwc:w-8" />
			</AppCardIcon>
			<AppCardTitle>Notifications</AppCardTitle>
			<AppCardBadge>12</AppCardBadge>
		</AppCard>
	);
}
