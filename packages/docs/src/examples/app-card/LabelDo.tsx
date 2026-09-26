/**
 * Use short, clear labels.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {PieChart} from "lucide-react";

export function LabelDo() {
	return <AppCard className="wwc:w-32" icon={<PieChart className="wwc:h-8 wwc:w-8" />} name="Analytics" />;
}
