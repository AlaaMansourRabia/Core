/**
 * Collapsible minimap to save space.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function Collapsible() {
	return (
		<MapMinimap collapsible defaultCollapsed={false} className="wwc:w-32 wwc:h-32">
			<MapMinimapViewport x={30} y={20} width={35} height={40} />
		</MapMinimap>
	);
}
