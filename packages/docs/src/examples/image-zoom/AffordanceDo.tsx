/**
 * Indicate zoomable images clearly.
 */
import {ImageZoom} from "@corensystem/coren-ui/image-zoom";
import {ZoomIn} from "lucide-react";

export function AffordanceDo() {
	return (
		<div className="wwc:relative wwc:w-64">
			<ImageZoom
				src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
				alt="Zoomable image"
				className="wwc:w-full wwc:h-48 wwc:object-cover"
			/>
			<div className="wwc:absolute wwc:bottom-2 wwc:right-2 wwc:bg-black/50 wwc:rounded wwc:p-1">
				<ZoomIn className="wwc:h-4 wwc:w-4 wwc:text-white" />
			</div>
		</div>
	);
}
