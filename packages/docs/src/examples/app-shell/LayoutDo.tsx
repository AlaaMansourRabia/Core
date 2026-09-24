/**
 * Use semantic regions.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellSidebar} from "@corensystem/coren-ui/app-shell";

export function LayoutDo() {
	return (
		<AppShell className="wwc:h-48 wwc:border wwc:rounded">
			<AppShellHeader role="banner">Header</AppShellHeader>
			<AppShellSidebar role="navigation">Nav</AppShellSidebar>
			<AppShellMain role="main">Content</AppShellMain>
		</AppShell>
	);
}
