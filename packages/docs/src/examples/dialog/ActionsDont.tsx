import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid unclear or missing action buttons.
 */
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@corensystem/coren-ui/dialog";

export function ActionsDont() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Important Action</DialogTitle>
				</DialogHeader>
				<p className="wwc:py-4">Are you sure?</p>
				{/* No clear actions - user has to click X to close */}
			</DialogContent>
		</Dialog>
	);
}
