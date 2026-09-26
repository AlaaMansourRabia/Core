/**
 * Bottom sheet with drag handle.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent, BottomSheetHandle} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function WithHandle() {
	return (
		<BottomSheet>
			<BottomSheetTrigger asChild>
				<Button>Open Sheet</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<BottomSheetHandle />
				<div className="wwc:p-4">
					<h2 className="wwc:text-lg wwc:font-semibold">Drag to resize</h2>
					<p className="wwc:text-muted-foreground">Pull the handle to adjust height.</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
