import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic confirmation dialog.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";

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
