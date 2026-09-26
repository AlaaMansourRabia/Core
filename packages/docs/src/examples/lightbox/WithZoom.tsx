import {Button} from "@corensystem/coren-ui/button";
/**
 * Lightbox with zoom controls.
 */
import {Lightbox, LightboxTrigger, LightboxContent, LightboxZoomControls} from "@corensystem/coren-ui/lightbox";

export function WithZoom() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Button variant="outline">View Image with Zoom</Button>
			</LightboxTrigger>
			<LightboxContent>
				<img
					src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=2000"
					alt="High resolution ocean"
					className="wwc:max-h-[80vh] wwc:max-w-[90vw]"
				/>
				<LightboxZoomControls />
			</LightboxContent>
		</Lightbox>
	);
}
