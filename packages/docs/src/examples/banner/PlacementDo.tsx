/**
 * Place banners prominently but not intrusively.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {Info} from "lucide-react";

export function PlacementDo() {
	return (
		<div className="wwc:space-y-4 wwc:rounded-lg wwc:border wwc:p-4">
			<Banner>
				<Info className="wwc:h-4 wwc:w-4" />
				<span>Banner at top of content area</span>
			</Banner>
			<div className="wwc:h-24 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center">
				<span className="wwc:text-muted-foreground">Page Content</span>
			</div>
		</div>
	);
}
