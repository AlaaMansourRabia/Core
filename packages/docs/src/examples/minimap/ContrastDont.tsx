/**
 * Avoid low contrast viewport.
 */
import {Minimap, MinimapViewport} from "@corensystem/coren-ui/minimap";

export function ContrastDont() {
	return (
		<Minimap className="wwc:w-20 wwc:h-48">
			<MinimapViewport position={30} size={25} className="wwc:opacity-10" />
		</Minimap>
	);
}
