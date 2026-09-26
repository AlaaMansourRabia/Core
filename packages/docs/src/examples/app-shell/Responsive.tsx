/**
 * Responsive app shell.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellSidebar} from "@corensystem/coren-ui/app-shell";

export function Responsive() {
	return (
		<AppShell responsive className="wwc:h-64 wwc:border wwc:rounded">
			<AppShellHeader className="wwc:border-b wwc:p-4">
				Responsive Header
			</AppShellHeader>
			<AppShellSidebar className="wwc:hidden wwc:md:block wwc:w-48 wwc:border-r wwc:p-4">
				Sidebar (hidden on mobile)
			</AppShellSidebar>
			<AppShellMain className="wwc:p-4">
				Content adapts to screen size
			</AppShellMain>
		</AppShell>
	);
}
