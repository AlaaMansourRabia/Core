/**
 * Avoid random ordering.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar} from "@corensystem/coren-ui/progress-list-item";

export function OrderDont() {
	return (
		<div className="wwc:space-y-1">
			<ProgressListItem>
				<ProgressListItemLabel>Complete</ProgressListItemLabel>
				<ProgressListItemBar value={100} />
			</ProgressListItem>
			<ProgressListItem>
				<ProgressListItemLabel>In Progress</ProgressListItemLabel>
				<ProgressListItemBar value={50} />
			</ProgressListItem>
			<ProgressListItem>
				<ProgressListItemLabel>Complete</ProgressListItemLabel>
				<ProgressListItemBar value={100} />
			</ProgressListItem>
		</div>
	);
}
