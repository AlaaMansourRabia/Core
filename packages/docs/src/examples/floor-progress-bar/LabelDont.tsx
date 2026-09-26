/**
 * Avoid cryptic floor codes.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function LabelDont() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="FL2-A3-NW" progress={80} />
			<FloorProgressBarFloor label="FL1-B2-SE" progress={100} />
			<FloorProgressBarFloor label="BM1-C1-SW" progress={50} />
		</FloorProgressBar>
	);
}
