/**
 * Use dividers for clear visual separation.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function DividerDo() {
	return (
		<List divided className="wwc:w-[150px]">
			<ListItem>Item A</ListItem>
			<ListItem>Item B</ListItem>
		</List>
	);
}
