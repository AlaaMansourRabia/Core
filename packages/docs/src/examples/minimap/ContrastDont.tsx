/**
 * Avoid placing over similarly colored backgrounds.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function ContrastDont() {
	return (
		<Minimap
			lon={-122.4194}
			lat={37.7749}
			label="Site"
		/>
	);
}
