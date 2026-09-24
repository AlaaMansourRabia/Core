import {Sidebar, SidebarContent, SidebarProvider, SidebarTrigger} from "@corensystem/coren-ui/sidebar";

export function AppShell({children}) {
	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarContent>{/* nav */}</SidebarContent>
			</Sidebar>
			<main>
				<SidebarTrigger />
				{children}
			</main>
		</SidebarProvider>
	);
}
