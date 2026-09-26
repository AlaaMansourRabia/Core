/**
 * List with dividers between items.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function Divided() {
	return (
		<List divided className="wwc:w-[200px]">
			<ListItem>Profile</ListItem>
			<ListItem>Settings</ListItem>
			<ListItem>Logout</ListItem>
		</List>
	);
}
