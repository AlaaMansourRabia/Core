/**
 * Show progress values.
 */
import {
	ProgressListItem,
	ProgressListItemLabel,
	ProgressListItemBar,
	ProgressListItemValue,
} from "@corensystem/coren-ui/progress-list-item";

export function FeedbackDo() {
	return (
		<ProgressListItem>
			<ProgressListItemLabel>Processing</ProgressListItemLabel>
			<ProgressListItemBar value={75} />
			<ProgressListItemValue>75%</ProgressListItemValue>
		</ProgressListItem>
	);
}
