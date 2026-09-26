import {Badge} from "@corensystem/coren-ui/badge";
/**
 * Avoid vague overflow indicators.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";

export function MoreButtonDont() {
	return (
		<OverflowList maxVisible={3}>
			<OverflowListItem>
				<Badge>Tag 1</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Tag 2</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Tag 3</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Tag 4</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Tag 5</Badge>
			</OverflowListItem>
			<OverflowListMore>{() => <Badge variant="outline">...</Badge>}</OverflowListMore>
		</OverflowList>
	);
}
