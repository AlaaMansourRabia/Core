/**
 * Destructive confirmation dialog.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function Destructive() {
	return (
		<ConfirmDialog
			title="Delete Item"
			description="This action cannot be undone. This will permanently delete the item."
			confirmLabel="Delete"
			variant="destructive"
			onConfirm={() => console.log("Deleted")}
		>
			<ConfirmDialogTrigger asChild>
				<Button variant="destructive">Delete</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
