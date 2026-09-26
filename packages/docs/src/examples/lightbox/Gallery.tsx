/**
 * Lightbox gallery with multiple images.
 */
import {Lightbox, LightboxTrigger, LightboxContent, LightboxGallery} from "@corensystem/coren-ui/lightbox";
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

const images = [
	{src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200", thumb: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop", alt: "Ocean"},
	{src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop", alt: "Mountains"},
	{src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200", thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop", alt: "Forest"},
];

export function Gallery() {
	return (
		<LightboxGallery>
			<div className="wwc:flex wwc:gap-2">
				{images.map((image, index) => (
					<Lightbox key={index}>
						<LightboxTrigger>
							<Thumbnail src={image.thumb} alt={image.alt} className="wwc:cursor-pointer" />
						</LightboxTrigger>
						<LightboxContent>
							<img src={image.src} alt={image.alt} className="wwc:max-h-[80vh] wwc:max-w-[90vw]" />
						</LightboxContent>
					</Lightbox>
				))}
			</div>
		</LightboxGallery>
	);
}
