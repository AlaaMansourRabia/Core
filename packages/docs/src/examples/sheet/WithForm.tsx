/**
 * Sheet containing a form.
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
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WithForm() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Add Contact</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>New Contact</SheetTitle>
					<SheetDescription>Add a new contact to your list.</SheetDescription>
				</SheetHeader>
				<div className="wwc:grid wwc:gap-4 wwc:py-4">
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="sheet-form-name">Name</Label>
						<Input id="sheet-form-name" placeholder="Full name" />
					</div>
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="sheet-form-email">Email</Label>
						<Input id="sheet-form-email" type="email" placeholder="Email" />
					</div>
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="sheet-form-phone">Phone</Label>
						<Input id="sheet-form-phone" type="tel" placeholder="Phone" />
					</div>
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Cancel</Button>
					</SheetClose>
					<Button>Add Contact</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
