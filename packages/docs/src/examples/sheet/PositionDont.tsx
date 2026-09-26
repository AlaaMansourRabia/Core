import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid using top/bottom sheets for detailed content.
 */
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@corensystem/coren-ui/sheet";

export function PositionDont() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">View Details</Button>
			</SheetTrigger>
			<SheetContent side="top">
				<SheetHeader>
					<SheetTitle>Item Details</SheetTitle>
				</SheetHeader>
				<div className="wwc:py-4 wwc:space-y-2">
					<p>
						<strong>Name:</strong> Example Item
					</p>
					<p>
						<strong>Status:</strong> Active
					</p>
					<p>
						<strong>Description:</strong> A longer description that needs more space...
					</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}
