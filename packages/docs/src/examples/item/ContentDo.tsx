/**
 * Keep item content concise.
 */
import {Item, ItemIcon, ItemLabel} from "@corensystem/coren-ui/item";
import {User} from "lucide-react";

export function ContentDo() {
	return (
		<Item>
			<ItemIcon><User className="wwc:h-4 wwc:w-4" /></ItemIcon>
			<ItemLabel>Profile</ItemLabel>
		</Item>
	);
}
