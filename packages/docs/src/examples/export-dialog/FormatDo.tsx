/**
 * Show relevant export formats.
 */
import {ExportDialog, ExportDialogTrigger, ExportDialogContent, ExportDialogFormat} from "@corensystem/coren-ui/export-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function FormatDo() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild><Button size="sm">Export</Button></ExportDialogTrigger>
			<ExportDialogContent>
				<ExportDialogFormat value="png">PNG Image</ExportDialogFormat>
				<ExportDialogFormat value="svg">SVG Vector</ExportDialogFormat>
				<ExportDialogFormat value="pdf">PDF Document</ExportDialogFormat>
			</ExportDialogContent>
		</ExportDialog>
	);
}
