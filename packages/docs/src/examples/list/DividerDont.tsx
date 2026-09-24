/**
 * Avoid dividers for tightly grouped items.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function DividerDont() {
	return (
		<List divided className="wwc:w-[150px]">
			<ListItem className="wwc:py-1">A</ListItem>
			<ListItem className="wwc:py-1">B</ListItem>
			<ListItem className="wwc:py-1">C</ListItem>
		</List>
	);
}
