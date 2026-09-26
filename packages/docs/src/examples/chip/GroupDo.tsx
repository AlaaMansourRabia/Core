/**
 * Group related filter chips together.
 */
import {Chip} from "@corensystem/coren-ui/chip";

export function GroupDo() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Chip defaultPressed>React</Chip>
			<Chip>Vue</Chip>
			<Chip>Angular</Chip>
		</div>
	);
}
