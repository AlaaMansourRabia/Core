/**
 * Show count in overflow indicator.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";
import {Badge} from "@corensystem/coren-ui/badge";

export function MoreButtonDo() {
	return (
		<OverflowList maxVisible={3}>
			<OverflowListItem><Badge>Tag 1</Badge></OverflowListItem>
			<OverflowListItem><Badge>Tag 2</Badge></OverflowListItem>
			<OverflowListItem><Badge>Tag 3</Badge></OverflowListItem>
			<OverflowListItem><Badge>Tag 4</Badge></OverflowListItem>
			<OverflowListItem><Badge>Tag 5</Badge></OverflowListItem>
			<OverflowListMore>
				{(count) => <Badge variant="outline">+{count} more</Badge>}
			</OverflowListMore>
		</OverflowList>
	);
}
