/**
 * Use consistent card sizes in grids.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {Home, Settings, Users} from "lucide-react";

export function SizeDo() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
			<AppCard className="wwc:w-32" icon={<Home className="wwc:h-6 wwc:w-6" />} name="Home" />
			<AppCard className="wwc:w-32" icon={<Settings className="wwc:h-6 wwc:w-6" />} name="Settings" />
			<AppCard className="wwc:w-32" icon={<Users className="wwc:h-6 wwc:w-6" />} name="Users" />
		</div>
	);
}
