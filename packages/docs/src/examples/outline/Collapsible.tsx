/**
 * Collapsible outline sections for long documents.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function Collapsible() {
	return (
		<Outline
			collapsible
			defaultCollapsed={["advanced"]}
			items={[
				{id: "basics", label: "Basics", level: 1},
				{id: "setup", label: "Setup", level: 2},
				{id: "advanced", label: "Advanced", level: 1},
				{id: "optimization", label: "Optimization", level: 2},
				{id: "caching", label: "Caching", level: 2},
			]}
		/>
	);
}
