/**
 * Export dialog with file preview.
 */
import {ExportDialog, ExportDialogTrigger, ExportDialogContent, ExportDialogPreview, ExportDialogAction} from "@corensystem/coren-ui/export-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function WithPreview() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild>
				<Button>Export</Button>
			</ExportDialogTrigger>
			<ExportDialogContent>
				<ExportDialogPreview>
					<div className="wwc:bg-muted wwc:p-4 wwc:rounded">Preview content</div>
				</ExportDialogPreview>
				<ExportDialogAction>Download PDF</ExportDialogAction>
			</ExportDialogContent>
		</ExportDialog>
	);
}
