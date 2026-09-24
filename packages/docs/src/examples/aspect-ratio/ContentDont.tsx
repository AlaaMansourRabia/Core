/**
 * Avoid forced aspect ratios that distort content.
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function ContentDont() {
	return (
		<div className="wwc:space-y-4">
			<div>
				<p className="wwc:text-sm wwc:mb-2">Video in Wrong Ratio (1:1)</p>
				<div className="wwc:w-48">
					<AspectRatio ratio={1 / 1}>
						{/* Video in square container - would be cropped/distorted */}
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-black wwc:text-white wwc:text-sm">
							Video (cropped)
						</div>
					</AspectRatio>
				</div>
			</div>
			<div>
				<p className="wwc:text-sm wwc:mb-2">Profile in Wide Ratio (16:9)</p>
				<div className="wwc:w-48">
					<AspectRatio ratio={16 / 9}>
						{/* Profile photo in wide container - awkward */}
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted wwc:text-sm">
							Avatar (stretched)
						</div>
					</AspectRatio>
				</div>
			</div>
		</div>
	);
}
