/**
 * Default app card showing an application tile.
 */
import {AppCard, AppCardIcon, AppCardTitle, AppCardDescription} from "@corensystem/coren-ui/app-card";
import {LayoutGrid} from "lucide-react";

export function Default() {
	return (
		<AppCard className="wwc:w-48">
			<AppCardIcon>
				<LayoutGrid className="wwc:h-8 wwc:w-8" />
			</AppCardIcon>
			<AppCardTitle>Dashboard</AppCardTitle>
			<AppCardDescription>View analytics</AppCardDescription>
		</AppCard>
	);
}
