import {Badge} from "@corensystem/coren-ui/badge";
import {X} from "lucide-react";

/** DON'T: Avoid adding click handlers or remove buttons to Badge. Use Chip for interactive elements. */
export function InteractiveDont() {
	return (
		<Badge id="badge-interactive-dont" variant="secondary" className="wwc:cursor-pointer">
			Filter tag
			<X className="wwc:size-3" />
		</Badge>
	);
}
