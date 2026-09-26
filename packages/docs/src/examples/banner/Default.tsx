/**
 * Basic informational banner.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {Info} from "lucide-react";

export function Default() {
	return (
		<Banner>
			<Info className="wwc:h-4 wwc:w-4" />
			<span>New features are available. Check out the changelog.</span>
		</Banner>
	);
}
