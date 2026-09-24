/**
 * Sidebar with notification badges.
 */
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuBadge,
} from "@corensystem/coren-ui/sidebar";
import {Inbox, Bell, MessageSquare, AlertCircle} from "lucide-react";

export function WithBadges() {
	return (
		<Sidebar className="wwc:w-64 wwc:border-r">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<Inbox className="wwc:h-4 wwc:w-4" />
									<span>Inbox</span>
									<SidebarMenuBadge>12</SidebarMenuBadge>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<Bell className="wwc:h-4 wwc:w-4" />
									<span>Notifications</span>
									<SidebarMenuBadge>3</SidebarMenuBadge>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<MessageSquare className="wwc:h-4 wwc:w-4" />
									<span>Messages</span>
									<SidebarMenuBadge>99+</SidebarMenuBadge>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<AlertCircle className="wwc:h-4 wwc:w-4" />
									<span>Issues</span>
									<SidebarMenuBadge variant="destructive">5</SidebarMenuBadge>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
