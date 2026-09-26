/**
 * Use consistent card sizes in grids.
 */
import {AppCard, AppCardIcon, AppCardTitle} from "@corensystem/coren-ui/app-card";
import {Home, Settings, Users} from "lucide-react";

export function SizeDo() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
			<AppCard className="wwc:w-32">
				<AppCardIcon>
					<Home className="wwc:h-6 wwc:w-6" />
				</AppCardIcon>
				<AppCardTitle>Home</AppCardTitle>
			</AppCard>
			<AppCard className="wwc:w-32">
				<AppCardIcon>
					<Settings className="wwc:h-6 wwc:w-6" />
				</AppCardIcon>
				<AppCardTitle>Settings</AppCardTitle>
			</AppCard>
			<AppCard className="wwc:w-32">
				<AppCardIcon>
					<Users className="wwc:h-6 wwc:w-6" />
				</AppCardIcon>
				<AppCardTitle>Users</AppCardTitle>
			</AppCard>
		</div>
	);
}
