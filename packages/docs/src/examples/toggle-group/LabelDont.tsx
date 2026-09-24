/**
 * Avoid icon-only groups without accessible labels.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";
import {Circle, Square, Triangle} from "lucide-react";

export function LabelDont() {
	return (
		<ToggleGroup type="single" defaultValue="a">
			<ToggleGroupItem value="a">
				<Circle className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="b">
				<Square className="wwc:size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="c">
				<Triangle className="wwc:size-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
