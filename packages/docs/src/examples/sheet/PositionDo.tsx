import {Button} from "@corensystem/coren-ui/button";
/**
 * Use right side for detail panels and editing.
 */
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetTrigger,
} from "@corensystem/coren-ui/sheet";

export function PositionDo() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>View Details</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Item Details</SheetTitle>
					<SheetDescription>Right-side sheets work well for viewing and editing content.</SheetDescription>
				</SheetHeader>
				<div className="wwc:py-4 wwc:space-y-2">
					<p>
						<strong>Name:</strong> Example Item
					</p>
					<p>
						<strong>Status:</strong> Active
					</p>
					<p>
						<strong>Created:</strong> Today
					</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}
