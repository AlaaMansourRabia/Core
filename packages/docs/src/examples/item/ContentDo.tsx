/**
 * Keep item content concise.
 */
import {Item, ItemTitle} from "@corensystem/coren-ui/item";
import {User} from "lucide-react";

export function ContentDo() {
	return (
		<Item>
			<ItemIcon>
				<User className="wwc:h-4 wwc:w-4" />
			</ItemIcon>
			<ItemTitle>Profile</ItemTitle>
		</Item>
	);
}
