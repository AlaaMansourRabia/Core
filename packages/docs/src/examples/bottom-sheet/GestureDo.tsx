/**
 * Support swipe gestures.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent, BottomSheetHandle} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function GestureDo() {
	return (
		<BottomSheet dismissOnSwipeDown>
			<BottomSheetTrigger asChild>
				<Button>Open</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<BottomSheetHandle />
				<div className="wwc:p-4">
					<p>Swipe down to dismiss</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
