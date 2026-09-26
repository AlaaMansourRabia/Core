/**
 * Image zoom triggered by click.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";

export function ClickToZoom() {
	return (
		<ImageZoom
			src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"
			alt="Click to zoom"
			trigger="click"
			className="wwc:w-64 wwc:h-48 wwc:object-cover wwc:cursor-zoom-in"
		/>
	);
}
