/**
 * Use action-specific button labels.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function ButtonsDo() {
	return (
		<ConfirmDialog
			title="Publish Article"
			description="This will make the article visible to all users."
			confirmLabel="Publish"
			cancelLabel="Cancel"
			onConfirm={() => {}}
		>
			<ConfirmDialogTrigger asChild>
				<Button>Publish</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
