import {Button} from "@corensystem/coren-ui/button";
/**
 * Responsive overflow list that adapts to container.
 */
import {OverflowList, OverflowListItem, OverflowListMore} from "@corensystem/coren-ui/overflow-list";

const actions = ["Edit", "Delete", "Archive", "Duplicate", "Share", "Export"];

export function Responsive() {
	return (
		<div className="wwc:w-full wwc:max-w-md wwc:border wwc:rounded wwc:p-4">
			<OverflowList responsive>
				{actions.map((action) => (
					<OverflowListItem key={action}>
						<Button variant="outline" size="sm">
							{action}
						</Button>
					</OverflowListItem>
				))}
				<OverflowListMore>
					{(count) => (
						<Button variant="ghost" size="sm">
							+{count}
						</Button>
					)}
				</OverflowListMore>
			</OverflowList>
		</div>
	);
}
