/**
 * Provide clear navigation for galleries.
 */
import {Lightbox, LightboxTrigger, LightboxContent, LightboxNavigation} from "@corensystem/coren-ui/lightbox";
import {Button} from "@corensystem/coren-ui/button";

export function NavigationDo() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Button variant="outline">View Gallery</Button>
			</LightboxTrigger>
			<LightboxContent>
				<img
					src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200"
					alt="Image 1 of 5"
				/>
				<LightboxNavigation
					currentIndex={0}
					totalImages={5}
					showThumbnails
				/>
			</LightboxContent>
		</Lightbox>
	);
}
