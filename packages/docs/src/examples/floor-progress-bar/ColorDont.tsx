/**
 * Avoid random decorative colors.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function ColorDont() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="3F" progress={100} color="pink" />
			<FloorProgressBarFloor label="2F" progress={50} color="cyan" />
			<FloorProgressBarFloor label="1F" progress={25} color="purple" />
		</FloorProgressBar>
	);
}
