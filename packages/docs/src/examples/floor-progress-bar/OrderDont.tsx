/**
 * Avoid random floor ordering.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function OrderDont() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="2F" progress={50} />
			<FloorProgressBarFloor label="1F" progress={25} />
			<FloorProgressBarFloor label="3F" progress={100} />
		</FloorProgressBar>
	);
}
