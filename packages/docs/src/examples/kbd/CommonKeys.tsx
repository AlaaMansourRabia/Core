/**
 * Common keyboard key representations.
 */
import {Kbd} from "@corensystem/coren-ui/kbd";

export function CommonKeys() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
			<Kbd>⌘</Kbd>
			<Kbd>⇧</Kbd>
			<Kbd>⌥</Kbd>
			<Kbd>⌃</Kbd>
			<Kbd>↵</Kbd>
			<Kbd>⌫</Kbd>
			<Kbd>Tab</Kbd>
			<Kbd>Esc</Kbd>
		</div>
	);
}
