/**
 * Time scrubber with event markers.
 */
import {TimeScrubber, TimeScrubberMarker} from "@corensystem/coren-ui/time-scrubber";

export function WithMarkers() {
	return (
		<TimeScrubber min={0} max={100} value={30}>
			<TimeScrubberMarker position={20} label="Event A" />
			<TimeScrubberMarker position={60} label="Event B" />
		</TimeScrubber>
	);
}
