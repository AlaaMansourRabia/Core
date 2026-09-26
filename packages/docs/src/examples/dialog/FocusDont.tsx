import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid focusing the close button by default.
 */
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@corensystem/coren-ui/dialog";
import {Input} from "@corensystem/coren-ui/input";

export function FocusDont() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open Form</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enter Details</DialogTitle>
				</DialogHeader>
				{/* No autoFocus - focus goes to close button */}
				<Input placeholder="Name" id="dialog-focus-dont-name" />
			</DialogContent>
		</Dialog>
	);
}
