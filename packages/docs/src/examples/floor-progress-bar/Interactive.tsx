/**
 * Interactive floor progress bar.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function Interactive() {
	return (
		<FloorProgressBar interactive>
			<FloorProgressBarFloor label="3F" progress={100} active />
			<FloorProgressBarFloor label="2F" progress={50} />
			<FloorProgressBarFloor label="1F" progress={25} />
		</FloorProgressBar>
	);
}
