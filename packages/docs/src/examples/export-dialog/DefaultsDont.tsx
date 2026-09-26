import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid requiring format selection.
 */
import {
	ExportDialog,
	ExportDialogTrigger,
	ExportDialogContent,
	ExportDialogFormat,
	ExportDialogAction,
} from "@corensystem/coren-ui/export-dialog";

export function DefaultsDont() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild>
				<Button size="sm">Export</Button>
			</ExportDialogTrigger>
			<ExportDialogContent>
				<ExportDialogFormat value="pdf">PDF</ExportDialogFormat>
				<ExportDialogFormat value="xlsx">Excel</ExportDialogFormat>
				<ExportDialogAction disabled>Select a format</ExportDialogAction>
			</ExportDialogContent>
		</ExportDialog>
	);
}
