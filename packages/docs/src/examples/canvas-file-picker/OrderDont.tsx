/**
 * Avoid random file ordering.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerItem} from "@corensystem/coren-ui/canvas-file-picker";

export function OrderDont() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerItem>z-old-file.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>a-new-file.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>m-file.fig</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
