/**
 * Avoid hiding banners or placing them out of flow.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {Info} from "lucide-react";

export function PlacementDont() {
	return (
		<div className="wwc:space-y-4 wwc:rounded-lg wwc:border wwc:p-4">
			<div className="wwc:h-24 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center">
				<span className="wwc:text-muted-foreground">Page Content</span>
			</div>
			<div className="wwc:h-24 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center">
				<span className="wwc:text-muted-foreground">More Content</span>
			</div>
			{/* Banner buried at bottom - easy to miss */}
			<Banner>
				<Info className="wwc:h-4 wwc:w-4" />
				<span>Important notification buried at bottom</span>
			</Banner>
		</div>
	);
}
