/**
 * Use appropriate minimap width.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function WidthDo() {
	return (
		<Minimap className="wwc:w-20 wwc:h-48">
			<MinimapViewport position={25} size={20} />
		</Minimap>
	);
}
