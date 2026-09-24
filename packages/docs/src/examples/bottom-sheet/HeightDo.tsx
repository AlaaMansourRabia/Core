/**
 * Use appropriate default height.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function HeightDo() {
	return (
		<BottomSheet defaultSnapPoint={0.5}>
			<BottomSheetTrigger asChild>
				<Button>Open</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<p>Opens at 50% - just right for this content.</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
