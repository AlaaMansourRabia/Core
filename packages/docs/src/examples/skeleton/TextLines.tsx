/**
 * Multiple skeleton lines to represent paragraph text.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function TextLines() {
	return (
		<div className="wwc:space-y-2">
			<Skeleton className="wwc:h-4 wwc:w-full" />
			<Skeleton className="wwc:h-4 wwc:w-full" />
			<Skeleton className="wwc:h-4 wwc:w-3/4" />
		</div>
	);
}
