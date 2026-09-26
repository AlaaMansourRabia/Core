/**
 * Avoid confusing interaction states.
 */
import {BottomSheet, BottomSheetTrigger, BottomSheetContent} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function BackdropDont() {
	return (
		<BottomSheet modal={false}>
			<BottomSheetTrigger asChild>
				<Button>Open</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<p>User can interact with content behind - may be confusing.</p>
				</div>
			</BottomSheetContent>
		</BottomSheet>
	);
}
