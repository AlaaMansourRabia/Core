/**
 * Use color to indicate status.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function ColorDo() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="3F" progress={100} color="success" />
			<FloorProgressBarFloor label="2F" progress={50} color="warning" />
			<FloorProgressBarFloor label="1F" progress={0} color="muted" />
		</FloorProgressBar>
	);
}
