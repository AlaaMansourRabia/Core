/**
 * Avoid overly long item content.
 */
import {Item, ItemIcon, ItemLabel, ItemDescription} from "@corensystem/coren-ui/item";
import {User} from "lucide-react";

export function ContentDont() {
	return (
		<Item>
			<ItemIcon><User className="wwc:h-4 wwc:w-4" /></ItemIcon>
			<ItemLabel>User Profile Settings and Preferences Configuration</ItemLabel>
			<ItemDescription>Click here to access your profile settings where you can configure all your personal preferences and account details</ItemDescription>
		</Item>
	);
}
