/**
 * Avoid missing previews for visual files.
 */
import {
	CanvasFilePicker,
	CanvasFilePickerTrigger,
	CanvasFilePickerContent,
	CanvasFilePickerItem,
} from "@corensystem/coren-ui/canvas-file-picker";

export function PreviewDont() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerItem>file_001.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>file_002.fig</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
