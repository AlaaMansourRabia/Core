/**
 * Basic aspect ratio container (16:9).
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function Default() {
	return (
		<div className="wwc:w-96">
			<AspectRatio ratio={16 / 9}>
				<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
					<span className="wwc:text-muted-foreground">16:9</span>
				</div>
			</AspectRatio>
		</div>
	);
}
