/**
 * Choose aspect ratios appropriate for content type.
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function ContentDo() {
	return (
		<div className="wwc:space-y-4">
			<div>
				<p className="wwc:text-sm wwc:mb-2">Video Player (16:9)</p>
				<div className="wwc:w-80">
					<AspectRatio ratio={16 / 9}>
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-black wwc:text-white">
							Video
						</div>
					</AspectRatio>
				</div>
			</div>
			<div>
				<p className="wwc:text-sm wwc:mb-2">Profile Avatar (1:1)</p>
				<div className="wwc:w-24">
					<AspectRatio ratio={1 / 1}>
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted">
							Avatar
						</div>
					</AspectRatio>
				</div>
			</div>
		</div>
	);
}
