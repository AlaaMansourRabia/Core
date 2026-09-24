/**
 * Show previews for visual file types.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerItem, CanvasFilePickerPreview} from "@corensystem/coren-ui/canvas-file-picker";

export function PreviewDo() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerItem>
					<CanvasFilePickerPreview src="/design.jpg" />
					Design File
				</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
