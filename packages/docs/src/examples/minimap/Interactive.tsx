/**
 * Interactive minimap with rotation on heading change.
 */
import {Minimap} from "@corensystem/coren-ui/minimap";

export function Interactive() {
	return (
		<Minimap
			lon={-122.4194}
			lat={37.7749}
			label="Site"
			heading={45}
		/>
	);
}
