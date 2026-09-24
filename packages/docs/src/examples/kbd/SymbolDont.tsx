/**
 * Avoid verbose modifier key names.
 */
import {Kbd} from "@corensystem/coren-ui/kbd";

export function SymbolDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1">
			<Kbd>Command</Kbd>
			<Kbd>S</Kbd>
		</div>
	);
}
