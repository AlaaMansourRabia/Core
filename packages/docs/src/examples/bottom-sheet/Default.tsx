/**
 * Basic bottom sheet for mobile.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<BottomSheet>
			<BottomSheetTrigger asChild>
				<Button>Open Sheet</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<h2 className="wwc:text-lg wwc:font-semibold">Bottom Sheet</h2>
					<p className="wwc:text-muted-foreground">Swipe down to close.</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
