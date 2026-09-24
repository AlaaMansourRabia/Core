/**
 * Avoid disabling gestures without reason.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function GestureDont() {
	return (
		<BottomSheet dismissOnSwipeDown={false}>
			<BottomSheetTrigger asChild>
				<Button>Open</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<p>Can only close with button</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
