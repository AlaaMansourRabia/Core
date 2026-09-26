/**
 * Use single type for mutually exclusive options.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";

export function TypeDo() {
	return (
		<ToggleGroup type="single" defaultValue="daily">
			<ToggleGroupItem value="daily">Daily</ToggleGroupItem>
			<ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
			<ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
		</ToggleGroup>
	);
}
