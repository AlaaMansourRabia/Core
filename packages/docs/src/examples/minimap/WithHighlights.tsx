/**
 * Minimap with highlighted sections.
 */
import {Minimap, MinimapViewport, MinimapHighlight} from "@corensystem/coren-ui/minimap";

export function WithHighlights() {
	return (
		<Minimap className="wwc:w-24 wwc:h-48">
			<MinimapHighlight position={10} size={15} color="warning" />
			<MinimapHighlight position={60} size={10} color="error" />
			<MinimapViewport position={20} size={30} />
		</Minimap>
	);
}
