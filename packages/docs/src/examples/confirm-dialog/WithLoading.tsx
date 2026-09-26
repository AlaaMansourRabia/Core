/**
 * Confirmation dialog with loading state.
 */
import {ConfirmDialog, ConfirmDialogTrigger} from "@corensystem/coren-ui/confirm-dialog";
import {Button} from "@corensystem/coren-ui/button";
import {useState} from "react";

export function WithLoading() {
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		setLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setLoading(false);
	};

	return (
		<ConfirmDialog
			title="Save Changes"
			description="Do you want to save your changes?"
			confirmLabel="Save"
			loading={loading}
			onConfirm={handleConfirm}
		>
			<ConfirmDialogTrigger asChild>
				<Button>Save</Button>
			</ConfirmDialogTrigger>
		</ConfirmDialog>
	);
}
