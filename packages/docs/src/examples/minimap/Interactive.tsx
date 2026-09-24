/**
 * Interactive minimap for code editor.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function Interactive() {
	return (
		<Minimap interactive className="wwc:w-24 wwc:h-48">
			<MinimapViewport position={30} size={25} draggable />
		</Minimap>
	);
}
