/**
 * Use short, clear labels.
 */
import {AppCard, AppCardIcon, AppCardTitle} from "@corensystem/coren-ui/app-card";
import {PieChart} from "lucide-react";

export function LabelDo() {
	return (
		<AppCard className="wwc:w-32">
			<AppCardIcon>
				<PieChart className="wwc:h-8 wwc:w-8" />
			</AppCardIcon>
			<AppCardTitle>Analytics</AppCardTitle>
		</AppCard>
	);
}
