/**
 * Avoid zooming low-resolution images.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function ResolutionDont() {
	return (
		<ImageZoom
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=100"
			alt="Pixelated zoom"
			zoomLevel={4}
			className="wwc:w-64 wwc:h-48 wwc:object-cover"
		/>
	);
}
