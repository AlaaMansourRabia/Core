/**
 * A card loading skeleton with avatar, title, and description.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function Card() {
	return (
		<div className="wwc:flex wwc:items-center wwc:space-x-4">
			<Skeleton className="wwc:h-12 wwc:w-12 wwc:rounded-full" />
			<div className="wwc:space-y-2">
				<Skeleton className="wwc:h-4 wwc:w-[250px]" />
				<Skeleton className="wwc:h-4 wwc:w-[200px]" />
			</div>
		</div>
	);
}
