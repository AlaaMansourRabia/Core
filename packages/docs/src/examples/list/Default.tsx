/**
 * A basic unordered list.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function Default() {
	return (
		<List className="wwc:w-[200px]">
			<ListItem>First item</ListItem>
			<ListItem>Second item</ListItem>
			<ListItem>Third item</ListItem>
		</List>
	);
}
