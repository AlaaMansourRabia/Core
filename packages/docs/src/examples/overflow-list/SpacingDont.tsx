/**
 * Avoid cramped or inconsistent spacing.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";
import {Badge} from "@corensystem/coren-ui/badge";

export function SpacingDont() {
	return (
		<OverflowList maxVisible={3}>
			<OverflowListItem><Badge>React</Badge></OverflowListItem>
			<OverflowListItem className="wwc:ml-4"><Badge>Vue</Badge></OverflowListItem>
			<OverflowListItem><Badge>Angular</Badge></OverflowListItem>
			<OverflowListItem><Badge>Svelte</Badge></OverflowListItem>
			<OverflowListMore>
				{(count) => <Badge>+{count}</Badge>}
			</OverflowListMore>
		</OverflowList>
	);
}
