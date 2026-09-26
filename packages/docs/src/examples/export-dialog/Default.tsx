import {Button} from "@corensystem/coren-ui/button";
/**
 * Default export dialog for file downloads.
 */
import {
	ExportDialog,
	ExportDialogTrigger,
	ExportDialogContent,
	ExportDialogFormat,
	ExportDialogAction,
} from "@corensystem/coren-ui/export-dialog";

export function Default() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild>
				<Button>Export</Button>
			</ExportDialogTrigger>
			<ExportDialogContent>
				<ExportDialogFormat value="pdf">PDF Document</ExportDialogFormat>
				<ExportDialogFormat value="xlsx">Excel Spreadsheet</ExportDialogFormat>
				<ExportDialogFormat value="csv">CSV File</ExportDialogFormat>
				<ExportDialogAction>Download</ExportDialogAction>
			</ExportDialogContent>
		</ExportDialog>
	);
}
