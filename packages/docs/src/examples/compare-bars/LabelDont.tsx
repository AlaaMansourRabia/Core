/**
 * Avoid bars without context.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function LabelDont() {
	return (
		<CompareBars>
			<CompareBar value={85} />
			<CompareBar value={80} />
		</CompareBars>
	);
}
