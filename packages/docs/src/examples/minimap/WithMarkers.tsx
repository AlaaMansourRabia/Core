/**
 * Minimap with custom label.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function WithMarkers() {
	return <Minimap lon={-122.4194} lat={37.7749} label="Site" />;
}
