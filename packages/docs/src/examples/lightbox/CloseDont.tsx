import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid hiding close controls.
 */
import {Lightbox, LightboxTrigger, LightboxContent} from "@corensystem/coren-ui/lightbox";

export function CloseDont() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Button variant="outline">View Image</Button>
			</LightboxTrigger>
			<LightboxContent hideClose>
				{/* No visible close button - user must know to press Escape */}
				<img src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200" alt="Ocean" />
			</LightboxContent>
		</Lightbox>
	);
}
