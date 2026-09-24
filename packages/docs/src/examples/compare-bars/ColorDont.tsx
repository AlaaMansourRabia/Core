/**
 * Avoid random color assignments.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function ColorDont() {
	return (
		<CompareBars>
			<CompareBar label="A" value={70} color="pink" />
			<CompareBar label="B" value={65} color="cyan" />
		</CompareBars>
	);
}
