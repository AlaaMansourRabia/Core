/**
 * List of progress items.
 */
import {ProgressListItem, ProgressListItemLabel, ProgressListItemBar} from "@corensystem/coren-ui/progress-list-item";

export function List() {
	return (
		<div className="wwc:space-y-2">
			<ProgressListItem>
				<ProgressListItemLabel>File 1</ProgressListItemLabel>
				<ProgressListItemBar value={100} />
			</ProgressListItem>
			<ProgressListItem>
				<ProgressListItemLabel>File 2</ProgressListItemLabel>
				<ProgressListItemBar value={45} />
			</ProgressListItem>
			<ProgressListItem>
				<ProgressListItemLabel>File 3</ProgressListItemLabel>
				<ProgressListItemBar value={10} />
			</ProgressListItem>
		</div>
	);
}
