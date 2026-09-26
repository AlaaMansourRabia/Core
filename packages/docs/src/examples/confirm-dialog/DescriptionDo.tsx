import {Button} from "@corensystem/coren-ui/button";
/**
 * Provide clear context in description.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";

export function DescriptionDo() {
	return (
		<ConfirmDialog
			title="Delete Project"
			description="This will permanently delete the project 'Marketing Campaign' and all 24 associated files. This action cannot be undone."
			confirmLabel="Delete Project"
			variant="destructive"
			onConfirm={() => {}}
		>
			<ConfirmDialogTrigger asChild>
				<Button variant="destructive">Delete</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
