/**
 * Minimap with position markers.
 */
import {Minimap, MinimapViewport, MinimapMarker} from "@corensystem/coren-ui/minimap";

export function WithMarkers() {
	return (
		<Minimap className="wwc:w-24 wwc:h-48">
			<MinimapMarker position={15} label="Error" />
			<MinimapMarker position={45} label="Warning" />
			<MinimapViewport position={20} size={30} />
		</Minimap>
	);
}
