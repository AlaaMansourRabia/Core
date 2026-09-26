/**
 * Timeline range with presets.
 */
import {TimelineRangeSelector, TimelineRangeSelectorPreset} from "@corensystem/coren-ui/timeline-range-selector";

export function Presets() {
	return (
		<TimelineRangeSelector start={0} end={7}>
			<TimelineRangeSelectorPreset label="Last 7 days" value={7} />
			<TimelineRangeSelectorPreset label="Last 30 days" value={30} />
		</TimelineRangeSelector>
	);
}
