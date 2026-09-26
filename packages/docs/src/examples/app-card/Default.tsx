/**
 * Default app card showing an application tile.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {LayoutGrid} from "lucide-react";

export function Default() {
	return (
		<AppCard
			className="wwc:w-48"
			icon={<LayoutGrid className="wwc:h-8 wwc:w-8" />}
			name="Dashboard"
			description="View analytics and metrics"
		/>
	);
}
