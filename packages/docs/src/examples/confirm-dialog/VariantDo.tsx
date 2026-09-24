/**
 * Use destructive variant for dangerous actions.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function VariantDo() {
	return (
		<ConfirmDialog
			title="Remove Member"
			description="This will remove the member from your team."
			confirmLabel="Remove"
			variant="destructive"
			onConfirm={() => {}}
		>
			<ConfirmDialogTrigger asChild>
				<Button variant="destructive">Remove Member</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
