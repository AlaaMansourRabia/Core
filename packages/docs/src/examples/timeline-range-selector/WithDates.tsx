/**
 * Timeline range with date labels.
 */
import {TimelineRangeSelector} from "@corensystem/coren-ui/timeline-range-selector";

export function WithDates() {
	return <TimelineRangeSelector start={0} end={30} formatLabel="date" />;
}
