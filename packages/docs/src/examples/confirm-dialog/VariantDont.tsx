/**
 * Avoid using default variant for destructive actions.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function VariantDont() {
	return (
		<ConfirmDialog
			title="Remove Member"
			description="This will remove the member from your team."
			confirmLabel="Remove"
			onConfirm={() => {}}
		>
			<ConfirmDialogTrigger asChild>
				<Button>Remove Member</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
