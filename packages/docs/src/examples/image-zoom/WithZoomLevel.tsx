/**
 * Image zoom with custom zoom level.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function WithZoomLevel() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<ImageZoom
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
				alt="2x zoom"
				zoomLevel={2}
				className="wwc:w-48 wwc:h-36 wwc:object-cover"
			/>
			<ImageZoom
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
				alt="3x zoom"
				zoomLevel={3}
				className="wwc:w-48 wwc:h-36 wwc:object-cover"
			/>
		</div>
	);
}
