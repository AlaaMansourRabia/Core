/**
 * Avoid ordered list for non-sequential items.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function SemanticDont() {
	return (
		<List ordered className="wwc:w-[180px]">
			<ListItem>Apple</ListItem>
			<ListItem>Orange</ListItem>
			<ListItem>Banana</ListItem>
		</List>
	);
}
