/**
 * Provide consistent spacing around separators.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function SpacingDo() {
	return (
		<div className="wwc:w-[200px]">
			<div className="wwc:text-sm">Header</div>
			<Separator className="wwc:my-4" />
			<div className="wwc:text-sm">Content</div>
		</div>
	);
}
