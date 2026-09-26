/**
 * Bottom sheet with snap points.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function SnapPoints() {
	return (
		<BottomSheet snapPoints={[0.25, 0.5, 0.9]}>
			<BottomSheetTrigger asChild>
				<Button>Open Sheet</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<h2 className="wwc:text-lg wwc:font-semibold">Snap Points</h2>
					<p className="wwc:text-muted-foreground">Drag to 25%, 50%, or 90% height.</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
