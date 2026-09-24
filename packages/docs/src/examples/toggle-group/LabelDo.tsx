/**
 * Include text labels for clarity when space allows.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";
import {LayoutList, Grid3x3} from "lucide-react";

export function LabelDo() {
	return (
		<ToggleGroup type="single" defaultValue="list">
			<ToggleGroupItem value="list">
				<LayoutList className="wwc:size-4" />
				List
			</ToggleGroupItem>
			<ToggleGroupItem value="grid">
				<Grid3x3 className="wwc:size-4" />
				Grid
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
