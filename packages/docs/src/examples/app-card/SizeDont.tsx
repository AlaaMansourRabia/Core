/**
 * Avoid inconsistent card sizes.
 */
import {AppCard, AppCardIcon, AppCardTitle} from "@corensystem/coren-ui/app-card";
import {Home, Settings, Users} from "lucide-react";

export function SizeDont() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<AppCard className="wwc:w-24">
				<AppCardIcon><Home className="wwc:h-4 wwc:w-4" /></AppCardIcon>
				<AppCardTitle>Home</AppCardTitle>
			</AppCard>
			<AppCard className="wwc:w-48">
				<AppCardIcon><Settings className="wwc:h-10 wwc:w-10" /></AppCardIcon>
				<AppCardTitle>Settings</AppCardTitle>
			</AppCard>
			<AppCard className="wwc:w-32">
				<AppCardIcon><Users className="wwc:h-6 wwc:w-6" /></AppCardIcon>
				<AppCardTitle>Users</AppCardTitle>
			</AppCard>
		</div>
	);
}
