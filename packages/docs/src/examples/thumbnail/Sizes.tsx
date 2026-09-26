/**
 * Different thumbnail sizes.
 */
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-end wwc:gap-4">
			<Thumbnail
				size="sm"
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=100&h=100&fit=crop"
				alt="Small thumbnail"
			/>
			<Thumbnail
				size="md"
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop"
				alt="Medium thumbnail"
			/>
			<Thumbnail
				size="lg"
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop"
				alt="Large thumbnail"
			/>
		</div>
	);
}
