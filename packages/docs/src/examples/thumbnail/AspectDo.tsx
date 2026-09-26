/**
 * Maintain consistent aspect ratios in grids.
 */
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function AspectDo() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-2">
			<Thumbnail
				aspectRatio="square"
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop"
				alt="Image 1"
			/>
			<Thumbnail
				aspectRatio="square"
				src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop"
				alt="Image 2"
			/>
			<Thumbnail
				aspectRatio="square"
				src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop"
				alt="Image 3"
			/>
		</div>
	);
}
