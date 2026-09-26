/**
 * Icons with custom colors.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Heart, AlertCircle, CheckCircle, Info} from "lucide-react";

export function WithColor() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<Icon icon={Heart} className="wwc:text-red-500" />
			<Icon icon={AlertCircle} className="wwc:text-yellow-500" />
			<Icon icon={CheckCircle} className="wwc:text-green-500" />
			<Icon icon={Info} className="wwc:text-blue-500" />
		</div>
	);
}
