/**
 * List with interactive/clickable items.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function Interactive() {
	return (
		<List divided className="wwc:w-[200px]">
			<ListItem interactive>Dashboard</ListItem>
			<ListItem interactive>Analytics</ListItem>
			<ListItem interactive>Reports</ListItem>
		</List>
	);
}
