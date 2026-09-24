/**
 * Basic icon usage.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Home, Settings, User} from "lucide-react";

export function Default() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<Icon icon={Home} />
			<Icon icon={Settings} />
			<Icon icon={User} />
		</div>
	);
}
