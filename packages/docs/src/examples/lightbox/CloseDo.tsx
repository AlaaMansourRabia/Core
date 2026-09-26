import {Button} from "@corensystem/coren-ui/button";
/**
 * Provide clear close affordance.
 */
import {Lightbox, LightboxTrigger, LightboxContent, LightboxClose} from "@corensystem/coren-ui/lightbox";

export function CloseDo() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Button variant="outline">View Image</Button>
			</LightboxTrigger>
			<LightboxContent>
				<LightboxClose />
				<img src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200" alt="Ocean" />
			</LightboxContent>
		</Lightbox>
	);
}
