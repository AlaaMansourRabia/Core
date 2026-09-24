/**
 * Default toggle group with single selection.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";
import {AlignLeft, AlignCenter, AlignRight} from "lucide-react";

export function Default() {
	return (
		<ToggleGroup type="single" defaultValue="left">
			<ToggleGroupItem value="left" aria-label="Align left">
				<AlignLeft className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
				<AlignCenter className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
				<AlignRight className="wwc:size-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
