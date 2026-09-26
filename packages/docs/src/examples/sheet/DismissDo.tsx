import {Button} from "@corensystem/coren-ui/button";
/**
 * Provide clear close affordance for sheets.
 */
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
	SheetTrigger,
	SheetClose,
} from "@corensystem/coren-ui/sheet";

export function DismissDo() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Open Panel</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Panel Title</SheetTitle>
				</SheetHeader>
				<p className="wwc:py-4">Panel content with clear close button.</p>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Close</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
