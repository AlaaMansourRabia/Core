/**
 * Place clear primary and secondary actions in footer.
 */
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
	DialogClose,
} from "@corensystem/coren-ui/dialog";
import {Button} from "@corensystem/coren-ui/button";

export function ActionsDo() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Delete Item</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Deletion</DialogTitle>
				</DialogHeader>
				<p className="wwc:py-4">This action cannot be undone.</p>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button variant="destructive">Delete</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
