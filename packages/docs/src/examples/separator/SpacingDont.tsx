/**
 * Avoid inconsistent spacing around separators.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function SpacingDont() {
	return (
		<div className="wwc:w-[200px]">
			<div className="wwc:text-sm">Header</div>
			<Separator className="wwc:mt-1 wwc:mb-6" />
			<div className="wwc:text-sm">Content</div>
		</div>
	);
}
