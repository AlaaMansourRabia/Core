/**
 * Floor progress bar with status indicators.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function WithStatus() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="3F" progress={100} status="complete" />
			<FloorProgressBarFloor label="2F" progress={75} status="in-progress" />
			<FloorProgressBarFloor label="1F" progress={0} status="pending" />
		</FloorProgressBar>
	);
}
