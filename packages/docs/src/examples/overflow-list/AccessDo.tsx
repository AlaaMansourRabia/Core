import {Badge} from "@corensystem/coren-ui/badge";
import {Button} from "@corensystem/coren-ui/button";
/**
 * Make hidden items accessible.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";

export function AccessDo() {
	return (
		<OverflowList maxVisible={2} expandable>
			<OverflowListItem>
				<Badge>Item 1</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Item 2</Badge>
			</OverflowListItem>
			<OverflowListItem>
				<Badge>Item 3</Badge>
			</OverflowListItem>
			<OverflowListMore expandable>
				{(count, _, expand) => (
					<Button variant="link" size="sm" onClick={expand}>
						Show {count} more
					</Button>
				)}
			</OverflowListMore>
		</OverflowList>
	);
}
