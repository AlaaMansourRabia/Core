/**
 * Use high-resolution images for zoom.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function ResolutionDo() {
	return (
		<ImageZoom
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
			zoomSrc="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=2000"
			alt="High-res zoom"
			className="wwc:w-64 wwc:h-48 wwc:object-cover"
		/>
	);
}
