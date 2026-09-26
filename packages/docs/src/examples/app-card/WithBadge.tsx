/**
 * App card with notification badge.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {Badge} from "@corensystem/coren-ui/badge";
import {Bell} from "lucide-react";

export function WithBadge() {
	return (
		<AppCard
			className="wwc:w-48"
			icon={<Bell className="wwc:h-8 wwc:w-8" />}
			name="Notifications"
			badge={<Badge variant="destructive">12</Badge>}
		/>
	);
}
