/**
 * Horizontal compare bars layout.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function Horizontal() {
	return (
		<CompareBars direction="horizontal" className="wwc:h-32">
			<CompareBar label="A" value={65} />
			<CompareBar label="B" value={82} />
			<CompareBar label="C" value={45} />
		</CompareBars>
	);
}
