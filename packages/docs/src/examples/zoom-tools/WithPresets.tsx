/**
 * Zoom tools with preset levels.
 */
import {ZoomTools} from "@corensystem/coren-ui/zoom-tools";

export function WithPresets() {
	return <ZoomTools value={100} presets={[50, 100, 150, 200]} />;
}
