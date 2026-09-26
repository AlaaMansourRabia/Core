/**
 * Use clear floor labels.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function LabelDo() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="Floor 2" progress={80} />
			<FloorProgressBarFloor label="Floor 1" progress={100} />
			<FloorProgressBarFloor label="Basement" progress={50} />
		</FloorProgressBar>
	);
}
