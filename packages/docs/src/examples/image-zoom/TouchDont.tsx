/**
 * Avoid hover-only zoom on touch devices.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function TouchDont() {
	return (
		<ImageZoom
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
			alt="Hover-only zoom"
			trigger="hover"
			enablePinchZoom={false}
			className="wwc:w-64 wwc:h-48 wwc:object-cover"
		/>
	);
}
