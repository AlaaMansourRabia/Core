/**
 * Tree list with selectable items.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function Selectable() {
	return (
		<TreeList selectable defaultSelected={["item-2"]}>
			<TreeItem id="item-1" label="Option 1" />
			<TreeItem id="item-2" label="Option 2 (selected)" />
			<TreeItem id="item-3" label="Option 3">
				<TreeItem id="item-3a" label="Sub-option A" />
				<TreeItem id="item-3b" label="Sub-option B" />
			</TreeItem>
		</TreeList>
	);
}
