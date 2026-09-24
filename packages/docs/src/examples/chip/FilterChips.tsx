/**
 * Multiple filter chips for selection.
 */
import {Chip} from "@corensystem/coren-ui/chip";

export function FilterChips() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Chip defaultPressed>All</Chip>
			<Chip>Design</Chip>
			<Chip>Development</Chip>
			<Chip>Marketing</Chip>
		</div>
	);
}
