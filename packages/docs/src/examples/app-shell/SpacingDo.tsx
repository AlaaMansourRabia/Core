/**
 * Consistent spacing throughout.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellSidebar} from "@corensystem/coren-ui/app-shell";

export function SpacingDo() {
	return (
		<AppShell padding="md" className="wwc:h-48 wwc:border wwc:rounded">
			<AppShellHeader>Header with consistent padding</AppShellHeader>
			<AppShellSidebar>Sidebar</AppShellSidebar>
			<AppShellMain>Content area</AppShellMain>
		</AppShell>
	);
}
