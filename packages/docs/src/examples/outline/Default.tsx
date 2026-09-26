/**
 * Basic document outline for page navigation.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function Default() {
	return (
		<Outline
			items={[
				{id: "intro", label: "Introduction", level: 1},
				{id: "getting-started", label: "Getting Started", level: 1},
				{id: "installation", label: "Installation", level: 2},
				{id: "configuration", label: "Configuration", level: 2},
				{id: "usage", label: "Usage", level: 1},
			]}
		/>
	);
}
