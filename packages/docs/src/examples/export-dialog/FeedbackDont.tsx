/**
 * Avoid no feedback during export.
 */
import {ExportDialog, ExportDialogContent} from "@corensystem/coren-ui/export-dialog";

export function FeedbackDont() {
	return (
		<ExportDialog open>
			<ExportDialogContent>
				<span className="wwc:text-muted-foreground">Please wait...</span>
			</ExportDialogContent>
		</ExportDialog>
	);
}
