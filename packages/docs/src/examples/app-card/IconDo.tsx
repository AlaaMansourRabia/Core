/**
 * Use clear, recognizable icons.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {Mail} from "lucide-react";

export function IconDo() {
	return <AppCard className="wwc:w-32" icon={<Mail className="wwc:h-8 wwc:w-8" />} name="Email" />;
}
