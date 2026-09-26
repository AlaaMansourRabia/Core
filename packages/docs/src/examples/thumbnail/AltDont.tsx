/**
 * Avoid generic or missing alt text.
 */
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function AltDont() {
	return (
		<Thumbnail
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop"
			alt="image"
		/>
	);
}
