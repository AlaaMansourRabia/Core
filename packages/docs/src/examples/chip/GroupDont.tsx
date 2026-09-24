/**
 * Avoid mixing chip variants in the same group.
 */
import {Chip} from "@corensystem/coren-ui/chip";
import {FileText} from "lucide-react";

export function GroupDont() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Chip defaultPressed>React</Chip>
			<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3.5 wwc:w-3.5" />}>
				file.js
			</Chip>
		</div>
	);
}
