import {Button} from "@corensystem/coren-ui/button";
/**
 * Export dialog for multiple items.
 */
import {
	ExportDialog,
	ExportDialogTrigger,
	ExportDialogContent,
	ExportDialogFormat,
	ExportDialogSummary,
	ExportDialogAction,
} from "@corensystem/coren-ui/export-dialog";

export function Multiple() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild>
				<Button>Export Selected</Button>
			</ExportDialogTrigger>
			<ExportDialogContent>
				<ExportDialogSummary>Exporting 5 items</ExportDialogSummary>
				<ExportDialogFormat value="zip">ZIP Archive</ExportDialogFormat>
				<ExportDialogAction>Download All</ExportDialogAction>
			</ExportDialogContent>
		</ExportDialog>
	);
}
