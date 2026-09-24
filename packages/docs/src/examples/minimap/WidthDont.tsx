/**
 * Avoid oversized minimaps.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function WidthDont() {
	return (
		<Minimap className="wwc:w-48 wwc:h-48">
			<MinimapViewport position={25} size={20} />
		</Minimap>
	);
}
