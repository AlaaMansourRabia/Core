/**
 * Order floors logically (top to bottom).
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function OrderDo() {
	return (
		<FloorProgressBar>
			<FloorProgressBarFloor label="3F" progress={100} />
			<FloorProgressBarFloor label="2F" progress={50} />
			<FloorProgressBarFloor label="1F" progress={25} />
		</FloorProgressBar>
	);
}
