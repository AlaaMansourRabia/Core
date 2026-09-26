/**
 * Canvas file picker with search functionality.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerSearch, CanvasFilePickerItem} from "@corensystem/coren-ui/canvas-file-picker";

export function WithSearch() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select File</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerSearch placeholder="Search files..." />
				<CanvasFilePickerItem>design-system.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>components.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>icons.fig</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
