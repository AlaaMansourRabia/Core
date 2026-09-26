/**
 * Aspect ratio with image content.
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function WithImage() {
	return (
		<div className="wwc:w-80">
			<AspectRatio ratio={16 / 9}>
				<div className="wwc:h-full wwc:w-full wwc:rounded-md wwc:bg-gradient-to-br wwc:from-primary/30 wwc:to-primary/10 wwc:flex wwc:items-center wwc:justify-center">
					<span className="wwc:text-muted-foreground">Image Placeholder</span>
				</div>
			</AspectRatio>
		</div>
	);
}
