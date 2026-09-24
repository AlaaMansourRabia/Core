/**
 * Default progress list item.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar} from "@corensystem/coren-ui/progress-list-item";

export function Default() {
	return (
		<ProgressListItem>
			<ProgressListItemLabel>Task 1</ProgressListItemLabel>
			<ProgressListItemBar value={75} />
		</ProgressListItem>
	);
}
