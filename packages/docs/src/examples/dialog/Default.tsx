import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic dialog for modal content.
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

export function Default() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open Dialog</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>Make changes to your profile here. Click save when done.</DialogDescription>
				</DialogHeader>
				<div className="wwc:py-4">
					<p>Dialog content goes here.</p>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
