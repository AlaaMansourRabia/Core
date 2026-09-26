/**
 * Avoid empty states without actionable guidance.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {FolderOpen} from "lucide-react";

export function GuidanceDont() {
	return (
		<Empty
			icon={<FolderOpen className="wwc:h-12 wwc:w-12" />}
			title="Empty"
			// No description or action - user doesn't know what to do
		/>
	);
}
