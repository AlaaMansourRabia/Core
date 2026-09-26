/**
 * Thumbnail with fallback for failed loads.
 */
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function WithFallback() {
	return <Thumbnail src="https://invalid-image-url.com/image.jpg" alt="Image with fallback" fallback="AB" />;
}
