/**
 * Outline with multiple nesting levels.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function DeepNesting() {
	return (
		<Outline
			items={[
				{id: "api", label: "API Reference", level: 1},
				{id: "components", label: "Components", level: 2},
				{id: "button", label: "Button", level: 3},
				{id: "input", label: "Input", level: 3},
				{id: "hooks", label: "Hooks", level: 2},
				{id: "use-state", label: "useState", level: 3},
				{id: "use-effect", label: "useEffect", level: 3},
			]}
		/>
	);
}
