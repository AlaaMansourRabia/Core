/**
 * Lightbox with image caption.
 */
import {Lightbox, LightboxTrigger, LightboxContent, LightboxCaption} from "@corensystem/coren-ui/lightbox";
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function WithCaption() {
	return (
		<Lightbox>
			<LightboxTrigger>
				<Thumbnail
					src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop"
					alt="Ocean waves"
					className="wwc:cursor-pointer"
				/>
			</LightboxTrigger>
			<LightboxContent>
				<img
					src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200"
					alt="Ocean waves"
					className="wwc:max-h-[70vh] wwc:max-w-[90vw]"
				/>
				<LightboxCaption>
					<p className="wwc:text-sm wwc:font-medium">Ocean Waves at Sunset</p>
					<p className="wwc:text-xs wwc:text-muted-foreground">Photo by John Doe • 2024</p>
				</LightboxCaption>
			</LightboxContent>
		</Lightbox>
	);
}
