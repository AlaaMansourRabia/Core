/**
 * Disabled app card for unavailable applications.
 */
import {AppCard, AppCardIcon, AppCardTitle, AppCardDescription} from "@corensystem/coren-ui/app-card";
import {Lock} from "lucide-react";

export function Disabled() {
	return (
		<AppCard disabled className="wwc:w-48">
			<AppCardIcon>
				<Lock className="wwc:h-8 wwc:w-8" />
			</AppCardIcon>
			<AppCardTitle>Restricted</AppCardTitle>
			<AppCardDescription>No access</AppCardDescription>
		</AppCard>
	);
}
