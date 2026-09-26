/**
 * Attachment chips for displaying files.
 */
import {Chip} from "@corensystem/coren-ui/chip";
import {FileText} from "lucide-react";

export function Attachment() {
	return (
		<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3.5 wwc:w-3.5" />}>
			document.pdf
		</Chip>
	);
}
