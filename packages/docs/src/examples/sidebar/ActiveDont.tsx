/**
 * Avoid sidebars without clear active state.
 */
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@corensystem/coren-ui/sidebar";
import {Home, FileText, Settings, Users} from "lucide-react";

export function ActiveDont() {
	return (
		<Sidebar className="wwc:w-64 wwc:border-r">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{/* No active state - user doesn't know where they are */}
							<SidebarMenuItem>
								<SidebarMenuButton>
									<Home className="wwc:h-4 wwc:w-4" />
									<span>Home</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<FileText className="wwc:h-4 wwc:w-4" />
									<span>Documents</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<Users className="wwc:h-4 wwc:w-4" />
									<span>Team</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
