/**
 * Common aspect ratio sizes.
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function Ratios() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-4">
			<div className="wwc:w-40">
				<AspectRatio ratio={1 / 1}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-sm wwc:text-muted-foreground">1:1</span>
					</div>
				</AspectRatio>
			</div>
			<div className="wwc:w-40">
				<AspectRatio ratio={4 / 3}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-sm wwc:text-muted-foreground">4:3</span>
					</div>
				</AspectRatio>
			</div>
			<div className="wwc:w-40">
				<AspectRatio ratio={16 / 9}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-sm wwc:text-muted-foreground">16:9</span>
					</div>
				</AspectRatio>
			</div>
			<div className="wwc:w-40">
				<AspectRatio ratio={21 / 9}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-sm wwc:text-muted-foreground">21:9</span>
					</div>
				</AspectRatio>
			</div>
		</div>
	);
}
