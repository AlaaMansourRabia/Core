/**
 * Tab items with leading icons.
 */
import {TabList} from "@corensystem/coren-ui/tab-list";
import {User, Settings, Bell} from "lucide-react";

export function WithIcons() {
	return (
		<TabList
			items={[
				{value: "profile", label: "Profile", icon: <User className="wwc:h-4 wwc:w-4" />},
				{value: "settings", label: "Settings", icon: <Settings className="wwc:h-4 wwc:w-4" />},
				{value: "notifications", label: "Alerts", icon: <Bell className="wwc:h-4 wwc:w-4" />},
			]}
			defaultValue="profile"
		/>
	);
}
