/**
 * Outline variant toggle group.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";
import {List, Grid3x3, Rows3} from "lucide-react";

export function Outline() {
	return (
		<ToggleGroup type="single" variant="outline" defaultValue="list">
			<ToggleGroupItem value="list" aria-label="List view">
				<List className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="grid" aria-label="Grid view">
				<Grid3x3 className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="rows" aria-label="Row view">
				<Rows3 className="wwc:size-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
