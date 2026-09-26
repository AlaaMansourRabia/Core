import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid galleries without navigation indicators.
 */
import {Lightbox, LightboxTrigger, LightboxContent} from "@corensystem/coren-ui/lightbox";

export function NavigationDont() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Button variant="outline">View Gallery</Button>
			</LightboxTrigger>
			<LightboxContent>
				<img src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200" alt="Image" />
				{/* No indication of position or how to navigate */}
			</LightboxContent>
		</Lightbox>
	);
}
