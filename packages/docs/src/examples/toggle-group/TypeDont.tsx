/**
 * Avoid using multiple type for mutually exclusive options.
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";

export function TypeDont() {
	return (
		<ToggleGroup type="multiple" defaultValue={["daily"]}>
			<ToggleGroupItem value="daily">Daily</ToggleGroupItem>
			<ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
			<ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
		</ToggleGroup>
	);
}
