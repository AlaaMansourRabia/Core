/**
 * Confirmation dialog with custom button labels.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function CustomButtons() {
	return (
		<ConfirmDialog
			title="Discard Draft?"
			description="You have unsaved changes that will be lost."
			confirmLabel="Discard"
			cancelLabel="Keep Editing"
			variant="destructive"
			onConfirm={() => console.log("Discarded")}
		>
			<ConfirmDialogTrigger asChild>
				<Button variant="outline">Close Editor</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
