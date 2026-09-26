import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic sheet panel sliding from the right.
 */
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetTrigger,
	SheetClose,
} from "@corensystem/coren-ui/sheet";

export function Default() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Sheet</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Edit Profile</SheetTitle>
					<SheetDescription>Make changes to your profile here.</SheetDescription>
				</SheetHeader>
				<div className="wwc:py-4">
					<p>Sheet content goes here.</p>
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Cancel</Button>
					</SheetClose>
					<Button>Save</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
