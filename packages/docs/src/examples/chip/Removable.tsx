/**
 * Attachment chip with remove button.
 */
import {Chip} from "@corensystem/coren-ui/chip";
import {FileText} from "lucide-react";

export function Removable() {
	return (
		<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3.5 wwc:w-3.5" />} onRemove={() => {}}>
			report.xlsx
		</Chip>
	);
}
