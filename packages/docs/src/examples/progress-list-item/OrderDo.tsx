/**
 * Order by progress status.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar} from "@corensystem/coren-ui/progress-list-item";

export function OrderDo() {
	return (
		<div className="wwc:space-y-1">
			<ProgressListItem>
				<ProgressListItemLabel>In Progress</ProgressListItemLabel>
				<ProgressListItemBar value={50} />
			</ProgressListItem>
			<ProgressListItem>
				<ProgressListItemLabel>Pending</ProgressListItemLabel>
				<ProgressListItemBar value={0} />
			</ProgressListItem>
			<ProgressListItem>
				<ProgressListItemLabel>Complete</ProgressListItemLabel>
				<ProgressListItemBar value={100} />
			</ProgressListItem>
		</div>
	);
}
