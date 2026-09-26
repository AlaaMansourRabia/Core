/**
 * Avoid similar colors that are hard to distinguish.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function ColorDont() {
	return (
		<Legend>
			<LegendItem color="#3b82f6" label="Type A" />
			<LegendItem color="#60a5fa" label="Type B" />
			<LegendItem color="#93c5fd" label="Type C" />
		</Legend>
	);
}
