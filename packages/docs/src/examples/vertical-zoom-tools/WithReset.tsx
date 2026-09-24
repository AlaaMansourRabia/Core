/**
 * Vertical zoom with reset button.
 */
import {VerticalZoomTools} from "@corensystem/coren-ui/vertical-zoom-tools";

export function WithReset() {
	return <VerticalZoomTools value={200} showReset />;
}
