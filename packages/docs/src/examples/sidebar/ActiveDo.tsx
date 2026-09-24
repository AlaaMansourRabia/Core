/**
 * Clearly indicate the current active page.
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

export function ActiveDo() {
	return (
		<Sidebar className="wwc:w-64 wwc:border-r">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<Home className="wwc:h-4 wwc:w-4" />
									<span>Home</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton isActive>
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
