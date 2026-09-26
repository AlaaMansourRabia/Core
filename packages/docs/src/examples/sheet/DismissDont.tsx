import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid hiding the close button for sheets.
 */
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@corensystem/coren-ui/sheet";

export function DismissDont() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Panel</Button>
			</SheetTrigger>
			<SheetContent showCloseButton={false}>
				<SheetHeader>
					<SheetTitle>Panel Title</SheetTitle>
				</SheetHeader>
				<p className="wwc:py-4">No visible close button - user must click overlay or press Escape.</p>
			</SheetContent>
		</Sheet>
	);
}
