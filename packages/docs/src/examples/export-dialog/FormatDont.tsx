import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid too many format options.
 */
import {
	ExportDialog,
	ExportDialogTrigger,
	ExportDialogContent,
	ExportDialogFormat,
} from "@corensystem/coren-ui/export-dialog";

export function FormatDont() {
	return (
		<ExportDialog>
			<ExportDialogTrigger asChild>
				<Button size="sm">Export</Button>
			</ExportDialogTrigger>
			<ExportDialogContent className="wwc:max-h-48 wwc:overflow-auto">
				<ExportDialogFormat value="png">PNG</ExportDialogFormat>
				<ExportDialogFormat value="jpg">JPG</ExportDialogFormat>
				<ExportDialogFormat value="gif">GIF</ExportDialogFormat>
				<ExportDialogFormat value="webp">WebP</ExportDialogFormat>
				<ExportDialogFormat value="svg">SVG</ExportDialogFormat>
				<ExportDialogFormat value="pdf">PDF</ExportDialogFormat>
				<ExportDialogFormat value="eps">EPS</ExportDialogFormat>
				<ExportDialogFormat value="tiff">TIFF</ExportDialogFormat>
			</ExportDialogContent>
		</ExportDialog>
	);
}
