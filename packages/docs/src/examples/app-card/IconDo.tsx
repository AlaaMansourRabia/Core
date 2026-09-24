/**
 * Use clear, recognizable icons.
 */
import {AppCard, AppCardIcon, AppCardTitle} from "@corensystem/coren-ui/app-card";
import {Mail} from "lucide-react";

export function IconDo() {
	return (
		<AppCard className="wwc:w-32">
			<AppCardIcon>
				<Mail className="wwc:h-8 wwc:w-8" />
			</AppCardIcon>
			<AppCardTitle>Email</AppCardTitle>
		</AppCard>
	);
}
