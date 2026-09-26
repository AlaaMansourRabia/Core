/**
 * Provide context for what the shortcut does.
 */
import {Kbd} from "@corensystem/coren-ui/kbd";

export function ContextDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:w-[200px]">
			<span className="wwc:text-sm">Save</span>
			<div className="wwc:flex wwc:items-center wwc:gap-1">
				<Kbd>⌘</Kbd>
				<Kbd>S</Kbd>
			</div>
		</div>
	);
}
