/**
 * Avoid skipping levels in outline hierarchy.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function HierarchyDont() {
	return (
		<Outline
			items={[
				{id: "section-1", label: "Section One", level: 1},
				{id: "deep-item", label: "Deeply Nested", level: 4},
				{id: "section-2", label: "Section Two", level: 1},
			]}
		/>
	);
}
