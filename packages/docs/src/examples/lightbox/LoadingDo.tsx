import {Button} from "@corensystem/coren-ui/button";
/**
 * Show loading state for images.
 */
import {Lightbox, LightboxTrigger, LightboxContent} from "@corensystem/coren-ui/lightbox";

export function LoadingDo() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Button variant="outline">View High-Res</Button>
			</LightboxTrigger>
			<LightboxContent showLoadingState>
				<img src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=4000" alt="High resolution ocean" />
			</LightboxContent>
		</Lightbox>
	);
}
