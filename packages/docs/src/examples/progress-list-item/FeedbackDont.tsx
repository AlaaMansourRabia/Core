/**
 * Avoid bar without values.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar} from "@corensystem/coren-ui/progress-list-item";

export function FeedbackDont() {
	return (
		<ProgressListItem>
			<ProgressListItemLabel>Processing</ProgressListItemLabel>
			<ProgressListItemBar value={75} />
		</ProgressListItem>
	);
}
