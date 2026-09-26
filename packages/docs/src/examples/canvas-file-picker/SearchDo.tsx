/**
 * Include search for large file lists.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerSearch, CanvasFilePickerItem} from "@corensystem/coren-ui/canvas-file-picker";

export function SearchDo() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerSearch placeholder="Filter files..." />
				<CanvasFilePickerItem>file-1.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>file-2.fig</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
