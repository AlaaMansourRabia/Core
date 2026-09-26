/**
 * Avoid vague or abbreviated labels.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function LabelsDont() {
	return (
		<Outline
			items={[
				{id: "s1", label: "Sec 1", level: 1},
				{id: "s2", label: "Misc", level: 1},
				{id: "s3", label: "Other", level: 1},
			]}
		/>
	);
}
