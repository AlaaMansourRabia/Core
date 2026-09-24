/**
 * A basic icon button with required tooltip.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Settings} from "lucide-react";

export function Default() {
	return (
		<IconButton tooltip="Settings">
			<Settings />
		</IconButton>
	);
}
