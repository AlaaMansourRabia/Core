/**
 * Avoid inconsistent card sizes.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {Home, Settings, Users} from "lucide-react";

export function SizeDont() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<AppCard className="wwc:w-24" icon={<Home className="wwc:h-4 wwc:w-4" />} name="Home" />
			<AppCard className="wwc:w-48" icon={<Settings className="wwc:h-10 wwc:w-10" />} name="Settings" />
			<AppCard className="wwc:w-32" icon={<Users className="wwc:h-6 wwc:w-6" />} name="Users" />
		</div>
	);
}
