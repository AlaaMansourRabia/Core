/**
 * Pre-select common format.
 */
import {ExportDialog, ExportDialogTrigger, ExportDialogContent, ExportDialogFormat, ExportDialogAction} from "@corensystem/coren-ui/export-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function DefaultsDo() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild><Button size="sm">Export</Button></ExportDialogTrigger>
			<ExportDialogContent>
				<ExportDialogFormat value="pdf" selected>PDF (Recommended)</ExportDialogFormat>
				<ExportDialogFormat value="xlsx">Excel</ExportDialogFormat>
				<ExportDialogAction>Export</ExportDialogAction>
			</ExportDialogContent>
		</ExportDialog>
	);
}
