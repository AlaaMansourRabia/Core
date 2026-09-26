/**
 * Default satellite minimap showing a location.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function Default() {
	return (
		<Minimap
			lon={-122.4194}
			lat={37.7749}
			label="Site"
		/>
	);
}
