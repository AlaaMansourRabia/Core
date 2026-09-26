/**
 * Avoid click handlers without visual feedback.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function InteractiveDont() {
	return (
		<List className="wwc:w-[150px]">
			<ListItem onClick={() => {}}>Click me</ListItem>
		</List>
	);
}
