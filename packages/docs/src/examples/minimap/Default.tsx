/**
 * Default minimap for content overview.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function Default() {
	return (
		<Minimap className="wwc:w-24 wwc:h-48">
			<MinimapViewport position={20} size={30} />
		</Minimap>
	);
}
