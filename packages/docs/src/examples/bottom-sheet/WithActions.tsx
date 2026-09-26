/**
 * Bottom sheet with action buttons.
 */
import {
	BottomSheet,
	BottomSheetTrigger,
	BottomSheetContent,
	BottomSheetFooter,
} from "@corensystem/coren-ui/bottom-sheet";
import {Button} from "@corensystem/coren-ui/button";

export function WithActions() {
	return (
		<BottomSheet>
			<BottomSheetTrigger asChild>
				<Button>Share</Button>
			</BottomSheetTrigger>
			<BottomSheetContent>
				<div className="wwc:p-4">
					<h2 className="wwc:text-lg wwc:font-semibold">Share with</h2>
					<div className="wwc:grid wwc:grid-cols-4 wwc:gap-4 wwc:mt-4">
						<Button variant="outline">Email</Button>
						<Button variant="outline">Copy</Button>
						<Button variant="outline">Message</Button>
						<Button variant="outline">More</Button>
					</div>
				</div>
				<BottomSheetFooter>
					<Button variant="ghost" className="wwc:w-full">
						Cancel
					</Button>
				</BottomSheetFooter>
			</BottomSheetContent>
		</BottomSheet>
	);
}
