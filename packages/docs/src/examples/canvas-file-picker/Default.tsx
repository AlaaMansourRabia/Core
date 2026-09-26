/**
 * Default canvas file picker for selecting design files.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerItem} from "@corensystem/coren-ui/canvas-file-picker";

export function Default() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select File</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerItem>design-v1.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>design-v2.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>wireframes.fig</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
