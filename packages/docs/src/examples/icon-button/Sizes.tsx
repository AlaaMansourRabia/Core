/**
 * Icon button sizes: sm, md, lg.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Plus} from "lucide-react";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<IconButton size="sm" tooltip="Small">
				<Plus />
			</IconButton>
			<IconButton size="md" tooltip="Medium">
				<Plus />
			</IconButton>
			<IconButton size="lg" tooltip="Large">
				<Plus />
			</IconButton>
		</div>
	);
}
