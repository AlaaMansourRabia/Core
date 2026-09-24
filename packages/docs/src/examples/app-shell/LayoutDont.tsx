/**
 * Avoid divs without semantic meaning.
 */
import {AppShell} from "@corensystem/coren-ui/app-shell";

export function LayoutDont() {
	return (
		<AppShell className="wwc:h-48 wwc:border wwc:rounded">
			<div>Header div</div>
			<div>Nav div</div>
			<div>Content div</div>
		</AppShell>
	);
}
