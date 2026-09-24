/**
 * Basic application shell layout.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellSidebar} from "@corensystem/coren-ui/app-shell";

export function Default() {
	return (
		<AppShell className="wwc:h-64 wwc:border wwc:rounded">
			<AppShellHeader className="wwc:border-b wwc:p-4">
				<span className="wwc:font-semibold">App Name</span>
			</AppShellHeader>
			<AppShellSidebar className="wwc:w-48 wwc:border-r wwc:p-4">
				Navigation
			</AppShellSidebar>
			<AppShellMain className="wwc:p-4">
				Main content area
			</AppShellMain>
		</AppShell>
	);
}
