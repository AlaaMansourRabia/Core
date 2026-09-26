/**
 * Skeleton placeholders for form fields.
 */
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function FormFields() {
	return (
		<div className="wwc:space-y-4 wwc:w-[300px]">
			<div className="wwc:space-y-2">
				<Skeleton className="wwc:h-4 wwc:w-16" />
				<Skeleton className="wwc:h-10 wwc:w-full" />
			</div>
			<div className="wwc:space-y-2">
				<Skeleton className="wwc:h-4 wwc:w-20" />
				<Skeleton className="wwc:h-10 wwc:w-full" />
			</div>
			<Skeleton className="wwc:h-10 wwc:w-24" />
		</div>
	);
}
