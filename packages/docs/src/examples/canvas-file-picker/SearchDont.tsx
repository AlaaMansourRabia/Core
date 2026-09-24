/**
 * Avoid long scrolling lists without search.
 */
import {CanvasFilePicker, CanvasFilePickerTrigger, CanvasFilePickerContent, CanvasFilePickerItem} from "@corensystem/coren-ui/canvas-file-picker";

export function SearchDont() {
	return (
		<CanvasFilePicker>
			<CanvasFilePickerTrigger>Select</CanvasFilePickerTrigger>
			<CanvasFilePickerContent className="wwc:max-h-32 wwc:overflow-auto">
				<CanvasFilePickerItem>file-001.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>file-002.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>file-003.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>file-004.fig</CanvasFilePickerItem>
				<CanvasFilePickerItem>file-005.fig</CanvasFilePickerItem>
			</CanvasFilePickerContent>
		</CanvasFilePicker>
	);
}
