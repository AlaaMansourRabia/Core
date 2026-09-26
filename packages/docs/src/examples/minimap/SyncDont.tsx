/**
 * Avoid static maps when the view is rotating.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function SyncDont() {
	return <Minimap lon={-122.4194} lat={37.7749} label="Site" />;
}
