/**
 * Use appropriate size for context. Medium works well in most cases.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function WidthDo() {
	return (
		<Minimap
			lon={-122.4194}
			lat={37.7749}
			label="Site"
		/>
	);
}
