/**
 * Progress list item with value display.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar, ProgressListItemValue} from "@corensystem/coren-ui/progress-list-item";

export function WithValue() {
	return (
		<ProgressListItem>
			<ProgressListItemLabel>Downloads</ProgressListItemLabel>
			<ProgressListItemBar value={60} />
			<ProgressListItemValue>60%</ProgressListItemValue>
		</ProgressListItem>
	);
}
