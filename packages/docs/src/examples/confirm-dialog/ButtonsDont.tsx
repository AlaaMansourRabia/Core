import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid generic Yes/No button labels.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";

export function ButtonsDont() {
	return (
		<ConfirmDialog
			title="Publish Article"
			description="This will make the article visible."
			confirmLabel="Yes"
			cancelLabel="No"
			onConfirm={() => {}}
		>
			<ConfirmDialogTrigger asChild>
				<Button>Publish</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
