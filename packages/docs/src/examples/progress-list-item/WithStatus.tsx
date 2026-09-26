/**
 * Progress list item with status.
 */
import {
	ProgressListItem,
	ProgressListItemLabel,
	ProgressListItemBar,
	ProgressListItemStatus,
} from "@corensystem/coren-ui/progress-list-item";

export function WithStatus() {
	return (
		<ProgressListItem>
			<ProgressListItemLabel>Upload</ProgressListItemLabel>
			<ProgressListItemBar value={100} />
			<ProgressListItemStatus status="complete">Done</ProgressListItemStatus>
		</ProgressListItem>
	);
}
