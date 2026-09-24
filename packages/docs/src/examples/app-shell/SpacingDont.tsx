/**
 * Avoid inconsistent spacing.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellSidebar} from "@corensystem/coren-ui/app-shell";

export function SpacingDont() {
	return (
		<AppShell className="wwc:h-48 wwc:border wwc:rounded">
			<AppShellHeader className="wwc:p-2">Tight padding</AppShellHeader>
			<AppShellSidebar className="wwc:p-8">Large padding</AppShellSidebar>
			<AppShellMain className="wwc:p-0">No padding</AppShellMain>
		</AppShell>
	);
}
