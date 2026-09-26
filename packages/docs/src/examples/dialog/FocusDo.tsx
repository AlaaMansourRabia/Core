import {Button} from "@corensystem/coren-ui/button";
/**
 * Focus the primary input when dialog opens.
 */
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@corensystem/coren-ui/dialog";
import {Input} from "@corensystem/coren-ui/input";

export function FocusDo() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Quick Search</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Search</DialogTitle>
				</DialogHeader>
				<Input autoFocus placeholder="Type to search..." id="dialog-focus-search" />
				<DialogFooter>
					<Button>Search</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
