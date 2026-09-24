/**
 * Keep minimap synced with content.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function SyncDo() {
	return (
		<Minimap sync className="wwc:w-20 wwc:h-48">
			<MinimapViewport position={50} size={20} />
		</Minimap>
	);
}
