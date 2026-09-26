/**
 * Avoid very small sizes that hide location details.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function WidthDont() {
	return <Minimap lon={-122.4194} lat={37.7749} label="Site" size="sm" />;
}
