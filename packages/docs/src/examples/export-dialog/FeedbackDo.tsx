/**
 * Show export progress.
 */
import {ExportDialog, ExportDialogContent, ExportDialogProgress} from "@corensystem/coren-ui/export-dialog";

export function FeedbackDo() {
	return (
		<ExportDialog open>
			<ExportDialogContent>
				<ExportDialogProgress value={65}>Exporting... 65%</ExportDialogProgress>
			</ExportDialogContent>
		</ExportDialog>
	);
}
