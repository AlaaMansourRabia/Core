/**
 * Avoid missing skip links.
 */
import {AppShell, AppShellHeader, AppShellMain} from "@corensystem/coren-ui/app-shell";

export function FocusDont() {
	return (
		<AppShell className="wwc:h-48 wwc:border wwc:rounded">
			{/* No skip link - keyboard users must tab through all nav */}
			<AppShellHeader>Long header with many links</AppShellHeader>
			<AppShellMain>Content</AppShellMain>
		</AppShell>
	);
}
