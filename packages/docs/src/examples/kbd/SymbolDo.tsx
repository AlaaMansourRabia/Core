/**
 * Use standard symbols for modifier keys.
 */
import {Kbd} from "@corensystem/coren-ui/kbd";

export function SymbolDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1">
			<Kbd>⌘</Kbd>
			<Kbd>S</Kbd>
		</div>
	);
}
