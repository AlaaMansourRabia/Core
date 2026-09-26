/**
 * Avoid toggle groups with many options (use Select instead).
 */
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";

export function CountDont() {
	return (
		<ToggleGroup type="single" defaultValue="jan" className="wwc:flex-wrap">
			{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
				<ToggleGroupItem key={m} value={m.toLowerCase()}>
					{m}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
