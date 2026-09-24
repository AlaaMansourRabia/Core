/**
 * Use separate Kbd elements for each key.
 */
import {Kbd} from "@corensystem/coren-ui/kbd";

export function SeparateDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1">
			<Kbd>Ctrl</Kbd>
			<Kbd>C</Kbd>
		</div>
	);
}
