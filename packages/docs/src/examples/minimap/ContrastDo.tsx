/**
 * Ensure viewport visibility.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function ContrastDo() {
	return (
		<Minimap className="wwc:w-20 wwc:h-48">
			<MinimapViewport position={30} size={25} highlighted />
		</Minimap>
	);
}
