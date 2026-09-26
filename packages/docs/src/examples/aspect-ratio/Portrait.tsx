/**
 * Portrait aspect ratios.
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function Portrait() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<div className="wwc:w-32">
				<AspectRatio ratio={3 / 4}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-sm wwc:text-muted-foreground">3:4</span>
					</div>
				</AspectRatio>
			</div>
			<div className="wwc:w-32">
				<AspectRatio ratio={9 / 16}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-sm wwc:text-muted-foreground">9:16</span>
					</div>
				</AspectRatio>
			</div>
			<div className="wwc:w-32">
				<AspectRatio ratio={2 / 3}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-sm wwc:text-muted-foreground">2:3</span>
					</div>
				</AspectRatio>
			</div>
		</div>
	);
}
