/**
 * Grid of app cards for launcher view.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {Calendar, FileText, Settings, Users} from "lucide-react";

export function Grid() {
	return (
		<div className="wwc:grid wwc:grid-cols-4 wwc:gap-4">
			<AppCard icon={<Settings className="wwc:h-6 wwc:w-6" />} name="Settings" />
			<AppCard icon={<FileText className="wwc:h-6 wwc:w-6" />} name="Documents" />
			<AppCard icon={<Users className="wwc:h-6 wwc:w-6" />} name="Team" />
			<AppCard icon={<Calendar className="wwc:h-6 wwc:w-6" />} name="Calendar" />
		</div>
	);
}
