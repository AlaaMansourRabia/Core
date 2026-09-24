/**
 * Use backdrop for modality.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function BackdropDo() {
	return (
		<BottomSheet modal>
			<BottomSheetTrigger asChild>
				<Button>Open</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<p>Backdrop prevents interaction with content behind.</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
