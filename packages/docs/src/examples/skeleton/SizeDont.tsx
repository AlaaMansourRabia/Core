/**
 * Avoid oversized skeletons that cause layout shift.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function SizeDont() {
	return <Skeleton className="wwc:h-20 wwc:w-64 wwc:rounded-md" />;
}
