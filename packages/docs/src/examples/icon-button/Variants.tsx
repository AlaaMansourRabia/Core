/**
 * Icon button variants: ghost, outline, default, secondary, destructive.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Trash2, Star, Plus, Settings, Edit} from "lucide-react";

export function Variants() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<IconButton variant="ghost" tooltip="Ghost">
				<Settings />
			</IconButton>
			<IconButton variant="outline" tooltip="Outline">
				<Edit />
			</IconButton>
			<IconButton variant="default" tooltip="Default">
				<Plus />
			</IconButton>
			<IconButton variant="secondary" tooltip="Secondary">
				<Star />
			</IconButton>
			<IconButton variant="destructive" tooltip="Delete">
				<Trash2 />
			</IconButton>
		</div>
	);
}
