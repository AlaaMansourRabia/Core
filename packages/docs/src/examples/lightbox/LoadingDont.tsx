/**
 * Avoid blank screens while loading.
 */
import {Lightbox, LightboxTrigger, LightboxContent} from "@corensystem/coren-ui/lightbox";
import {Button} from "@corensystem/coren-ui/button";

export function LoadingDont() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Button variant="outline">View High-Res</Button>
			</LightboxTrigger>
			<LightboxContent>
				{/* No loading indicator - blank screen while image loads */}
				<img
					src="https://slow-server.example.com/huge-image.jpg"
					alt="Slow loading image"
				/>
			</LightboxContent>
		</Lightbox>
	);
}
