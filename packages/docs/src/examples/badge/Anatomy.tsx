import {Badge} from "@corensystem/coren-ui/badge";
import {Check} from "lucide-react";

/** Anatomy example showing the badge container, optional leading icon, and label text. */
export function Anatomy() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-8">
			<Badge id="badge-anatomy-simple" variant="default">
				Label
			</Badge>
			<Badge id="badge-anatomy-with-icon" variant="success">
				<Check className="wwc:size-3" />
				With Icon
			</Badge>
		</div>
	);
}
