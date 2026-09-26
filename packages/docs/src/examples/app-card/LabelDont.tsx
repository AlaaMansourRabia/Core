/**
 * Avoid long, verbose labels.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {PieChart} from "lucide-react";

export function LabelDont() {
	return (
		<AppCard className="wwc:w-48" icon={<PieChart className="wwc:h-8 wwc:w-8" />} name="Business Analytics Dashboard" />
	);
}
