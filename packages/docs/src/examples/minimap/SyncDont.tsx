/**
 * Avoid delayed or unsync viewport.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function SyncDont() {
	return (
		<Minimap className="wwc:w-20 wwc:h-48">
			<MinimapViewport position={10} size={20} />
		</Minimap>
	);
}
