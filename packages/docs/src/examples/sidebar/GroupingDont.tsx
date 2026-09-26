/**
 * Avoid flat lists without logical grouping.
 */
import {
	Sidebar,
	SidebarContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@corensystem/coren-ui/sidebar";
import {Home, FileText, BarChart, Users, Settings, Bell, CreditCard} from "lucide-react";

export function GroupingDont() {
	return (
		<Sidebar className="wwc:w-64 wwc:border-r">
			<SidebarContent>
				{/* All items in flat list - hard to scan */}
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton><Home className="wwc:h-4 wwc:w-4" /><span>Dashboard</span></SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton><FileText className="wwc:h-4 wwc:w-4" /><span>Documents</span></SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton><BarChart className="wwc:h-4 wwc:w-4" /><span>Analytics</span></SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton><Users className="wwc:h-4 wwc:w-4" /><span>Team</span></SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton><Bell className="wwc:h-4 wwc:w-4" /><span>Notifications</span></SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton><CreditCard className="wwc:h-4 wwc:w-4" /><span>Billing</span></SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton><Settings className="wwc:h-4 wwc:w-4" /><span>Settings</span></SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}
