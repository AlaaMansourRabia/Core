/**
 * Dialog containing a form.
 */
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
	DialogClose,
} from "@corensystem/coren-ui/dialog";
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WithForm() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Add Item</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Item</DialogTitle>
					<DialogDescription>Fill in the details below.</DialogDescription>
				</DialogHeader>
				<div className="wwc:grid wwc:gap-4 wwc:py-4">
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="dialog-form-name">Name</Label>
						<Input id="dialog-form-name" placeholder="Item name" />
					</div>
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="dialog-form-desc">Description</Label>
						<Input id="dialog-form-desc" placeholder="Description" />
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button>Add</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
