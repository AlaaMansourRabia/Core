/**
 * Color picker with preset palette.
 */
import {ToolbarColorPicker} from "@corensystem/coren-ui/toolbar-color-picker";

export function WithPalette() {
	return <ToolbarColorPicker colors={["#ff0000", "#00ff00", "#0000ff", "#ffff00"]} />;
}
