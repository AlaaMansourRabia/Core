/**
 * Icons in different sizes.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Star} from "lucide-react";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<Icon icon={Star} size="xs" />
			<Icon icon={Star} size="sm" />
			<Icon icon={Star} size="md" />
			<Icon icon={Star} size="lg" />
			<Icon icon={Star} size="xl" />
		</div>
	);
}
