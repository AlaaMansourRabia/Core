/**
 * Skip links for accessibility.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellSkipLink} from "@corensystem/coren-ui/app-shell";

export function FocusDo() {
	return (
		<AppShell className="wwc:h-48 wwc:border wwc:rounded">
			<AppShellSkipLink href="#main">Skip to content</AppShellSkipLink>
			<AppShellHeader>Header</AppShellHeader>
			<AppShellMain id="main">Main content</AppShellMain>
		</AppShell>
	);
}
