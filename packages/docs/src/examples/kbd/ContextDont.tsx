/**
 * Avoid showing shortcuts without labels.
 */
import {Kbd} from "@corensystem/coren-ui/kbd";

export function ContextDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1">
			<Kbd>⌘</Kbd>
			<Kbd>S</Kbd>
		</div>
	);
}
