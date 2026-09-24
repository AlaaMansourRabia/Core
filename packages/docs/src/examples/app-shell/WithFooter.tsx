/**
 * App shell with footer.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellFooter} from "@corensystem/coren-ui/app-shell";

export function WithFooter() {
	return (
		<AppShell className="wwc:h-64 wwc:border wwc:rounded">
			<AppShellHeader className="wwc:border-b wwc:p-4">Header</AppShellHeader>
			<AppShellMain className="wwc:p-4">Content</AppShellMain>
			<AppShellFooter className="wwc:border-t wwc:p-4">
				Footer content
			</AppShellFooter>
		</AppShell>
	);
}
