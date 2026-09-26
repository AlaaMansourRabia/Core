/**
 * Show recent files first.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerGroup, CanvasFilePickerItem} from "@corensystem/coren-ui/canvas-file-picker";

export function OrderDo() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerGroup label="Recent">
					<CanvasFilePickerItem>latest.fig</CanvasFilePickerItem>
				</CanvasFilePickerGroup>
				<CanvasFilePickerGroup label="Older">
					<CanvasFilePickerItem>archive.fig</CanvasFilePickerItem>
				</CanvasFilePickerGroup>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
