/**
 * Avoid hidden zoom functionality.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function AffordanceDont() {
	return (
		<ImageZoom
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
			alt="No zoom indicator"
			className="wwc:w-64 wwc:h-48 wwc:object-cover"
		/>
	);
}
