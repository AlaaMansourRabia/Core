/**
 * Avoid long, verbose labels.
 */
import {AppCard, AppCardIcon, AppCardTitle} from "@corensystem/coren-ui/app-card";
import {PieChart} from "lucide-react";

export function LabelDont() {
	return (
		<AppCard className="wwc:w-48">
			<AppCardIcon>
				<PieChart className="wwc:h-8 wwc:w-8" />
			</AppCardIcon>
			<AppCardTitle>Business Analytics Dashboard</AppCardTitle>
		</AppCard>
	);
}
