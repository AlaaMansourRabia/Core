/**
 * Avoid for actions or non-exclusive choices.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function UseCaseDont() {
	return (
		<SegmentedControl
			value="save"
			options={[
				{value: "save", label: "Save"},
				{value: "delete", label: "Delete"},
				{value: "share", label: "Share"},
			]}
		/>
	);
}
