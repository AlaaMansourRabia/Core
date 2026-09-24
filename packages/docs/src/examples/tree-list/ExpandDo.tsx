/**
 * Use sensible default expansion states.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function ExpandDo() {
	return (
		<TreeList defaultExpanded={["root"]}>
			<TreeItem id="root" label="Project Files">
				<TreeItem label="src">
					<TreeItem label="components" />
					<TreeItem label="utils" />
				</TreeItem>
				<TreeItem label="tests" />
			</TreeItem>
		</TreeList>
	);
}
