import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarTrigger,
} from "@corensystem/coren-ui/sidebar";
import {Home, FileText, Settings, Users, PanelLeft} from "lucide-react";
/**
 * Collapsible sidebar with icon-only mode.
 */
import * as React from "react";

export function Collapsible() {
	const [collapsed, setCollapsed] = React.useState(false);

	return (
		<div className="wwc:flex">
			<Sidebar className={`wwc:border-r wwc:transition-all ${collapsed ? "wwc:w-16" : "wwc:w-64"}`}>
				<div className="wwc:flex wwc:h-12 wwc:items-center wwc:justify-end wwc:px-2">
					<SidebarTrigger onClick={() => setCollapsed(!collapsed)}>
						<PanelLeft className="wwc:h-4 wwc:w-4" />
					</SidebarTrigger>
				</div>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton isActive>
										<Home className="wwc:h-4 wwc:w-4" />
										{!collapsed && <span>Home</span>}
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton>
										<FileText className="wwc:h-4 wwc:w-4" />
										{!collapsed && <span>Documents</span>}
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton>
										<Users className="wwc:h-4 wwc:w-4" />
										{!collapsed && <span>Team</span>}
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton>
										<Settings className="wwc:h-4 wwc:w-4" />
										{!collapsed && <span>Settings</span>}
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
		</div>
	);
}
