/**
 * Use descriptive labels.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar} from "@corensystem/coren-ui/progress-list-item";

export function LabelDo() {
	return (
		<ProgressListItem>
			<ProgressListItemLabel>report-2024.pdf</ProgressListItemLabel>
			<ProgressListItemBar value={50} />
		</ProgressListItem>
	);
}
