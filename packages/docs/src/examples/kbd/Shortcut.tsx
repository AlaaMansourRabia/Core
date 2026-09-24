/**
 * Display keyboard shortcuts with multiple keys.
 */
import {Kbd} from "@corensystem/coren-ui/kbd";

export function Shortcut() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1">
			<Kbd>⌘</Kbd>
			<Kbd>K</Kbd>
		</div>
	);
}
