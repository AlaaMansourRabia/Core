/**
 * Avoid taking full screen for small content.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function HeightDont() {
	return (
		<BottomSheet defaultSnapPoint={1}>
			<BottomSheetTrigger asChild>
				<Button>Open</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<p>Full screen for tiny content.</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
