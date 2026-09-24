/**
 * Overflow list with popover for hidden items.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";
import {Badge} from "@corensystem/coren-ui/badge";
import {Popover, PopoverTrigger, PopoverContent} from "@corensystem/coren-ui/popover";
import {Button} from "@corensystem/coren-ui/button";

const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];

export function WithPopover() {
	return (
		<OverflowList maxVisible={3}>
			{items.map((item) => (
				<OverflowListItem key={item}>
					<Badge>{item}</Badge>
				</OverflowListItem>
			))}
			<OverflowListMore>
				{(count, hiddenItems) => (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm">+{count} more</Button>
						</PopoverTrigger>
						<PopoverContent className="wwc:w-auto">
							<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
								{hiddenItems}
							</div>
						</PopoverContent>
					</Popover>
				)}
			</OverflowListMore>
		</OverflowList>
	);
}
