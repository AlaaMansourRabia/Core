/**
 * Basic lightbox for viewing images.
 */
import {Lightbox, LightboxTrigger, LightboxContent} from "@corensystem/coren-ui/lightbox";
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

export function Default() {
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
					alt="Ocean waves full size"
					className="wwc:max-h-[80vh] wwc:max-w-[90vw] wwc:object-contain"
				/>
			</LightboxContent>
		</Lightbox>
	);
}
