/**
 * Image zoom with magnifying lens.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function WithLens() {
	return (
		<ImageZoom
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"
			alt="Magnifying lens"
			variant="lens"
			lensSize={150}
			className="wwc:w-64 wwc:h-48 wwc:object-cover"
		/>
	);
}
