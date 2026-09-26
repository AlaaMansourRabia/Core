/**
 * Use clear, descriptive labels for navigation items.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function LabelsDo() {
	return (
		<Outline
			items={[
				{id: "intro", label: "Introduction to React Hooks", level: 1},
				{id: "setup", label: "Setting Up Your Environment", level: 1},
				{id: "examples", label: "Practical Examples", level: 1},
			]}
		/>
	);
}
