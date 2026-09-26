/**
 * Disabled-style app card for unavailable applications.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {Lock} from "lucide-react";

export function Disabled() {
	return (
		<AppCard
			className="wwc:w-48 wwc:opacity-50 wwc:pointer-events-none"
			icon={<Lock className="wwc:h-8 wwc:w-8" />}
			name="Restricted"
			description="No access"
		/>
	);
}
