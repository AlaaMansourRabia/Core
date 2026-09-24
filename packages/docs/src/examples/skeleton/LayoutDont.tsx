/**
 * Avoid uniform skeleton sizes that don't reflect content.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function LayoutDont() {
	return (
		<div className="wwc:space-y-3 wwc:w-[200px]">
			<Skeleton className="wwc:h-4 wwc:w-full" />
			<Skeleton className="wwc:h-4 wwc:w-full" />
			<Skeleton className="wwc:h-4 wwc:w-full" />
		</div>
	);
}
