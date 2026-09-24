/**
 * Show loading state while images load.
 */
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function LoadingDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Thumbnail
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop"
				alt="Ocean"
				showLoadingState
			/>
			<Thumbnail
				src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop"
				alt="Mountains"
				showLoadingState
			/>
		</div>
	);
}
