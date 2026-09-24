/**
 * App shell with collapsible sidebar.
 */
import {AppShell, AppShellHeader, AppShellMain, AppShellSidebar} from "@corensystem/coren-ui/app-shell";
import {Button} from "@corensystem/coren-ui/button";
import {Menu} from "lucide-react";

export function Collapsible() {
	return (
		<AppShell className="wwc:h-64 wwc:border wwc:rounded">
			<AppShellHeader className="wwc:border-b wwc:p-4 wwc:flex wwc:items-center wwc:gap-2">
				<Button variant="ghost" size="icon">
					<Menu className="wwc:h-4 wwc:w-4" />
				</Button>
				<span className="wwc:font-semibold">App</span>
			</AppShellHeader>
			<AppShellSidebar collapsible collapsed className="wwc:w-16 wwc:border-r">
				Icons
			</AppShellSidebar>
			<AppShellMain className="wwc:p-4">Content</AppShellMain>
		</AppShell>
	);
}
