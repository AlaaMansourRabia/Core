/**
 * Thumbnail gallery grid.
 */
import {Thumbnail} from "@corensystem/coren-ui/thumbnail";

const images = [
	{id: 1, src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop", alt: "Ocean"},
	{id: 2, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop", alt: "Mountains"},
	{id: 3, src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop", alt: "Forest"},
	{id: 4, src: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=150&h=150&fit=crop", alt: "Lake"},
];

export function Gallery() {
	return (
		<div className="wwc:grid wwc:grid-cols-4 wwc:gap-2">
			{images.map((image) => (
				<Thumbnail key={image.id} src={image.src} alt={image.alt} />
			))}
		</div>
	);
}
