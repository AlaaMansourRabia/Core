/**
 * Avoid vague or generic descriptions.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function DescriptionDont() {
	return (
		<ConfirmDialog
			title="Delete"
			description="Are you sure?"
			confirmLabel="OK"
			onConfirm={() => {}}
		>
			<ConfirmDialogTrigger asChild>
				<Button variant="destructive">Delete</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
