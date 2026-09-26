/**
 * Grid of app cards for launcher view.
 */
import {AppCard, AppCardIcon, AppCardTitle} from "@corensystem/coren-ui/app-card";
import {Settings, FileText, Users, Calendar} from "lucide-react";

export function Grid() {
	return (
		<div className="wwc:grid wwc:grid-cols-4 wwc:gap-4">
			<AppCard>
				<AppCardIcon><Settings className="wwc:h-6 wwc:w-6" /></AppCardIcon>
				<AppCardTitle>Settings</AppCardTitle>
			</AppCard>
			<AppCard>
				<AppCardIcon><FileText className="wwc:h-6 wwc:w-6" /></AppCardIcon>
				<AppCardTitle>Documents</AppCardTitle>
			</AppCard>
			<AppCard>
				<AppCardIcon><Users className="wwc:h-6 wwc:w-6" /></AppCardIcon>
				<AppCardTitle>Team</AppCardTitle>
			</AppCard>
			<AppCard>
				<AppCardIcon><Calendar className="wwc:h-6 wwc:w-6" /></AppCardIcon>
				<AppCardTitle>Calendar</AppCardTitle>
			</AppCard>
		</div>
	);
}
