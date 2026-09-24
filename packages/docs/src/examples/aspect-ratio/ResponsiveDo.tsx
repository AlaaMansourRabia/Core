/**
 * Let aspect ratio container scale with width.
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function ResponsiveDo() {
	return (
		<div className="wwc:w-full wwc:max-w-md">
			<AspectRatio ratio={16 / 9}>
				<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
					<span className="wwc:text-muted-foreground">
						Responsive - scales with container
					</span>
				</div>
			</AspectRatio>
		</div>
	);
}
