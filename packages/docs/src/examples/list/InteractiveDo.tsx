/**
 * Use interactive prop for clickable items.
 */
import {List, ListItem} from "@corensystem/coren-ui/list";

export function InteractiveDo() {
	return (
		<List className="wwc:w-[150px]">
			<ListItem interactive onClick={() => {}}>
				Click me
			</ListItem>
		</List>
	);
}
