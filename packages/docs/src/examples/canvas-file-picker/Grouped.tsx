/**
 * Canvas file picker with grouped items.
 */
import {
	CanvasFilePicker,
	CanvasFilePickerTrigger,
	CanvasFilePickerContent,
	CanvasFilePickerGroup,
	CanvasFilePickerItem,
} from "@corensystem/coren-ui/canvas-file-picker";

export function Grouped() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select File</CanvasFilePickerTrigger>
			<CanvasFilePickerContent>
				<CanvasFilePickerGroup label="Recent">
					<CanvasFilePickerItem>current-project.fig</CanvasFilePickerItem>
				</CanvasFilePickerGroup>
				<CanvasFilePickerGroup label="All Files">
					<CanvasFilePickerItem>archive-2024.fig</CanvasFilePickerItem>
					<CanvasFilePickerItem>templates.fig</CanvasFilePickerItem>
				</CanvasFilePickerGroup>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
