import {Sidebar, SidebarContent, SidebarProvider, SidebarTrigger} from "@core/core-ui/sidebar";

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
