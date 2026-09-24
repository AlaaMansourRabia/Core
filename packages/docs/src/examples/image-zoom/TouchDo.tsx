/**
 * Support pinch-to-zoom on mobile.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function TouchDo() {
	return (
		<ImageZoom
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
			alt="Touch-friendly zoom"
			enablePinchZoom
			className="wwc:w-64 wwc:h-48 wwc:object-cover"
		/>
	);
}
