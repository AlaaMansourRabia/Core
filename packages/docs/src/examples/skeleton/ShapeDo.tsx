/**
 * Match skeleton shape to the content it represents.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function ShapeDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-3">
			<Skeleton className="wwc:h-10 wwc:w-10 wwc:rounded-full" />
			<Skeleton className="wwc:h-4 wwc:w-24" />
		</div>
	);
}
