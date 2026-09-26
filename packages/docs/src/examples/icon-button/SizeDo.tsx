/**
 * Match icon button size to surrounding elements.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Input} from "@corensystem/coren-ui/input";
import {Search} from "lucide-react";

export function SizeDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Input placeholder="Search..." className="wwc:h-8 wwc:w-[150px]" />
			<IconButton size="sm" tooltip="Search">
				<Search />
			</IconButton>
		</div>
	);
}
