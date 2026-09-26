/**
 * Consistent spacing between items.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";
import {Badge} from "@corensystem/coren-ui/badge";

export function SpacingDo() {
	return (
		<OverflowList maxVisible={3} className="wwc:gap-2">
			<OverflowListItem><Badge>React</Badge></OverflowListItem>
			<OverflowListItem><Badge>Vue</Badge></OverflowListItem>
			<OverflowListItem><Badge>Angular</Badge></OverflowListItem>
			<OverflowListItem><Badge>Svelte</Badge></OverflowListItem>
			<OverflowListMore>
				{(count) => <Badge variant="outline">+{count}</Badge>}
			</OverflowListMore>
		</OverflowList>
	);
}
