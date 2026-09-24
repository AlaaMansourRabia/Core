/**
 * Include remove button for dismissible attachments.
 */
import {Chip} from "@corensystem/coren-ui/chip";
import {FileText} from "lucide-react";

export function RemoveDo() {
	return (
		<Chip
			variant="attachment"
			leadingIcon={<FileText className="wwc:h-3.5 wwc:w-3.5" />}
			onRemove={() => {}}
			removeLabel="Remove file"
		>
			data.csv
		</Chip>
	);
}
