/**
 * Citation size variants.
 */
import {Citation} from "@corensystem/coren-ui/citation";

export function Sizes() {
	return (
		<div className="wwc:space-y-2">
			<Citation size="sm" author="Small" source="Source" />
			<Citation size="md" author="Medium" source="Source" />
			<Citation size="lg" author="Large" source="Source" />
		</div>
	);
}
