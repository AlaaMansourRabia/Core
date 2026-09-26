/**
 * Basic confirmation dialog.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<ConfirmDialog
			title="Confirm Action"
			description="Are you sure you want to proceed?"
			onConfirm={() => console.log("Confirmed")}
		>
			<ConfirmDialogTrigger asChild>
				<Button>Open Dialog</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
