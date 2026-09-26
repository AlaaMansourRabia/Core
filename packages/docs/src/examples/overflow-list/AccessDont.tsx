import {Badge} from "@corensystem/coren-ui/badge";
/**
 * Avoid permanently hiding items.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";

export function AccessDont() {
	return (
		<OverflowList maxVisible={2}>
			<OverflowListItem>
				<Badge>Item 1</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Item 2</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Item 3</Badge>
			</OverflowListItem>
			<OverflowListMore>
				{/* No way to see hidden items */}
				{(count) => <Badge variant="secondary">+{count}</Badge>}
			</OverflowListMore>
		</OverflowList>
	);
}
