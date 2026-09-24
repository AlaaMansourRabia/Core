/**
 * Export dialog with configuration options.
 */
import {ExportDialog, ExportDialogTrigger, ExportDialogContent, ExportDialogFormat, ExportDialogOptions, ExportDialogAction} from "@corensystem/coren-ui/export-dialog";
import {Button} from "@corensystem/coren-ui/button";
import {Checkbox} from "@corensystem/coren-ui/checkbox";

export function WithOptions() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild>
				<Button>Export</Button>
			</ExportDialogTrigger>
			<ExportDialogContent>
				<ExportDialogFormat value="pdf">PDF</ExportDialogFormat>
				<ExportDialogOptions>
					<Checkbox id="export-headers" /> Include headers
					<Checkbox id="export-images" /> Include images
				</ExportDialogOptions>
				<ExportDialogAction>Export</ExportDialogAction>
			</ExportDialogContent>
		</ExportDialog>
	);
}
