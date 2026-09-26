/**
 * Minimap with different size variants.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function WithHighlights() {
	return (
		<Minimap
			lon={-122.4194}
			lat={37.7749}
			label="Site"
			size="lg"
		/>
	);
}
