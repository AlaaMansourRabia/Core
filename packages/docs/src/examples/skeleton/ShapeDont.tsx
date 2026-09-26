/**
 * Avoid generic shapes that don't match content.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function ShapeDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-3">
			<Skeleton className="wwc:h-10 wwc:w-10" />
			<Skeleton className="wwc:h-10 wwc:w-24" />
		</div>
	);
}
