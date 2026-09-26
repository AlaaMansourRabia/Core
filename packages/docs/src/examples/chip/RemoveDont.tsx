/**
 * Avoid remove button without accessible label.
 */
import {Chip} from "@corensystem/coren-ui/chip";
import {FileText} from "lucide-react";

export function RemoveDont() {
	return (
		<Chip
			variant="attachment"
			leadingIcon={<FileText className="wwc:h-3.5 wwc:w-3.5" />}
			onRemove={() => {}}
		>
			data.csv
		</Chip>
	);
}
