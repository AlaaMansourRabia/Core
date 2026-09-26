/**
 * Use toggle group for 2-5 options.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";

export function CountDo() {
	return (
		<ToggleGroup type="single" defaultValue="s">
			<ToggleGroupItem value="xs">XS</ToggleGroupItem>
			<ToggleGroupItem value="s">S</ToggleGroupItem>
			<ToggleGroupItem value="m">M</ToggleGroupItem>
			<ToggleGroupItem value="l">L</ToggleGroupItem>
		</ToggleGroup>
	);
}
