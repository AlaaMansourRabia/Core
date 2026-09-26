/**
 * Mirror the actual content layout closely.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function LayoutDo() {
	return (
		<div className="wwc:space-y-3 wwc:w-[200px]">
			<Skeleton className="wwc:h-5 wwc:w-3/4" />
			<Skeleton className="wwc:h-4 wwc:w-full" />
			<Skeleton className="wwc:h-4 wwc:w-5/6" />
		</div>
	);
}
