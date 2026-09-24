/**
 * Avoid unattributed quotes when source is known.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function AttributionDont() {
	return (
		<Blockquote>
			Simplicity is the ultimate sophistication.
			{/* No attribution - readers don't know the source */}
		</Blockquote>
	);
}
