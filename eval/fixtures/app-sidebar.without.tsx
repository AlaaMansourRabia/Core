import {Sidebar, SidebarContent, SidebarTrigger} from "@corensystem/core-ui/sidebar";

export function AppShell({children}) {
	return (
		<div className="wwc:flex">
			<Sidebar>
				<SidebarContent>{/* nav */}</SidebarContent>
			</Sidebar>
			<main>
				<SidebarTrigger />
				{children}
			</main>
		</div>
	);
}
