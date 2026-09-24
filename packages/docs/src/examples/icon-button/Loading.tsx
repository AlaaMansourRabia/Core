/**
 * Icon button with loading state.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Save} from "lucide-react";

export function Loading() {
	return (
		<IconButton loading tooltip="Saving...">
			<Save />
		</IconButton>
	);
}
