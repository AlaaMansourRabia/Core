/**
 * Default floor progress bar for building floors.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function Default() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="3F" progress={100} />
			<FloorProgressBarFloor label="2F" progress={75} />
			<FloorProgressBarFloor label="1F" progress={30} />
			<FloorProgressBarFloor label="B1" progress={0} />
		</FloorProgressBar>
	);
}
