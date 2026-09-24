/**
 * Basic empty state with icon and message.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {FileText} from "lucide-react";

export function Default() {
	return (
		<Empty
			icon={<FileText className="wwc:h-12 wwc:w-12" />}
			title="No documents"
			description="Get started by creating a new document."
		/>
	);
}
