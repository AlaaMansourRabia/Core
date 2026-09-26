/**
 * Canvas file picker with thumbnail previews.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerItem, CanvasFilePickerPreview} from "@corensystem/coren-ui/canvas-file-picker";

export function WithPreview() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select File</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerItem>
					<CanvasFilePickerPreview src="/thumb1.jpg" />
					Homepage Design
				</CanvasFilePickerItem>
				<CanvasFilePickerItem>
					<CanvasFilePickerPreview src="/thumb2.jpg" />
					Dashboard Layout
				</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
