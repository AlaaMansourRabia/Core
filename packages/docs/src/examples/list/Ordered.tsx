/**
 * An ordered (numbered) list.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function Ordered() {
	return (
		<List ordered className="wwc:w-[200px]">
			<ListItem>First step</ListItem>
			<ListItem>Second step</ListItem>
			<ListItem>Third step</ListItem>
		</List>
	);
}
