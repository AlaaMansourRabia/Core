/**
 * Timeline range with constraints.
 */
import {TimelineRangeSelector} from "@corensystem/coren-ui/timeline-range-selector";

export function Constrained() {
	return <TimelineRangeSelector start={10} end={50} minRange={10} maxRange={60} />;
}
