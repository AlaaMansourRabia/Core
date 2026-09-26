/**
 * Avoid layout shift from unloaded images.
 */
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function LoadingDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			{/* No loading state or reserved space */}
			<Thumbnail src="https://slow-loading-image.example.com/1.jpg" alt="Slow loading image 1" />
			<Thumbnail src="https://slow-loading-image.example.com/2.jpg" alt="Slow loading image 2" />
		</div>
	);
}
