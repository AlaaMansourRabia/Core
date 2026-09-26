/**
 * Horizontal floor progress layout.
 */
import {FloorProgressBar, FloorProgressBarFloor} from "@corensystem/coren-ui/floor-progress-bar";

export function Horizontal() {
	return (
		<FloorProgressBar direction="horizontal">
			<FloorProgressBarFloor label="A" progress={100} />
			<FloorProgressBarFloor label="B" progress={65} />
			<FloorProgressBarFloor label="C" progress={40} />
			<FloorProgressBarFloor label="D" progress={10} />
		</FloorProgressBar>
	);
}
