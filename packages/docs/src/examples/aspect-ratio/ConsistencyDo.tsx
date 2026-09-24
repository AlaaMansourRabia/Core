/**
 * Use consistent aspect ratios for similar content.
 */
import {AspectRatio} from "@corensystem/coren-ui/aspect-ratio";

export function ConsistencyDo() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4 wwc:w-96">
			{[1, 2, 3].map((i) => (
				<AspectRatio key={i} ratio={1 / 1}>
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted">
						<span className="wwc:text-muted-foreground">Photo {i}</span>
					</div>
				</AspectRatio>
			))}
		</div>
	);
}
