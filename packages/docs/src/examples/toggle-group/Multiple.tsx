/**
 * Toggle group allowing multiple selections.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";
import {Bold, Italic, Underline} from "lucide-react";

export function Multiple() {
	return (
		<ToggleGroup type="multiple" defaultValue={["bold"]}>
			<ToggleGroupItem value="bold" aria-label="Bold">
				<Bold className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="italic" aria-label="Italic">
				<Italic className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="underline" aria-label="Underline">
				<Underline className="wwc:size-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
