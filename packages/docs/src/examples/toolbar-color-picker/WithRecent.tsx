/**
 * Color picker with recent colors.
 */
import {ToolbarColorPicker} from "@corensystem/coren-ui/toolbar-color-picker";

export function WithRecent() {
	return <ToolbarColorPicker showRecent recentColors={["#333", "#666"]} />;
}
