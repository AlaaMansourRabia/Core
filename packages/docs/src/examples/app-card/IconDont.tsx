/**
 * Avoid generic or unclear icons.
 */
import {AppCard} from "@corensystem/coren-ui/app-card";
import {Circle} from "lucide-react";

export function IconDont() {
	return <AppCard className="wwc:w-32" icon={<Circle className="wwc:h-8 wwc:w-8" />} name="Email" />;
}
