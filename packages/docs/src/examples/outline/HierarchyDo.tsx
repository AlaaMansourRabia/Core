/**
 * Maintain consistent heading hierarchy in outlines.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function HierarchyDo() {
	return (
		<Outline
			items={[
				{id: "section-1", label: "Section One", level: 1},
				{id: "subsection-1a", label: "Subsection A", level: 2},
				{id: "subsection-1b", label: "Subsection B", level: 2},
				{id: "section-2", label: "Section Two", level: 1},
				{id: "subsection-2a", label: "Subsection A", level: 2},
			]}
		/>
	);
}
