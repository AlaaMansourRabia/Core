/**
 * Avoid generic labels.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar} from "@corensystem/coren-ui/progress-list-item";

export function LabelDont() {
	return (
		<ProgressListItem>
			<ProgressListItemLabel>Item</ProgressListItemLabel>
			<ProgressListItemBar value={50} />
		</ProgressListItem>
	);
}
