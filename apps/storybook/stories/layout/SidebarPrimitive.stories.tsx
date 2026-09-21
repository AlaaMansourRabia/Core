import type {Meta, StoryObj} from "storybook/internal/types";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@wakecap/core-ui/sidebar";
import {Home, type LucideIcon, Settings, Users} from "lucide-react";

// The generic, composable Sidebar PRIMITIVE set (SidebarProvider + Sidebar + SidebarMenu…). This is
// the component layer; the branded product sidebar is the CoreAppSidebar *widget* (see
// "Layout/Sidebar"). Use these primitives to build a custom sidebar; use CoreAppSidebar for the
// standard WakeCap shell. Stories render expanded (deterministic); use the trigger to collapse live.
const meta = {
	title: "Components/Layout/Sidebar Primitive",
	component: Sidebar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"The composable sidebar primitive set. **When to use:** building a custom collapsible app sidebar from parts " +
					"(`SidebarProvider`, `Sidebar`, `SidebarHeader/Content/Footer`, `SidebarGroup`, `SidebarMenu`/`MenuItem`/" +
					"`MenuButton`, `SidebarTrigger`). **When NOT to use:** for the standard WakeCap product sidebar, use the " +
					"`CoreAppSidebar` widget instead of re-assembling these. **Requires** a `SidebarProvider` ancestor. Related: " +
					"`CoreAppSidebar`, `NavigationMenu`, `Tabs`.",
			},
		},
	},
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAV: {id: string; label: string; icon: LucideIcon; active?: boolean}[] = [
	{id: "overview", label: "Overview", icon: Home, active: true},
	{id: "members", label: "Members", icon: Users},
	{id: "settings", label: "Settings", icon: Settings},
];

export const Composition: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"A minimal custom sidebar assembled from the primitives, inside a `SidebarProvider`, beside a main content " +
					"area. Header → grouped menu (one item active) → footer.",
			},
		},
	},
	render: () => (
		<SidebarProvider>
			<div className="wwc:flex wwc:h-[420px] wwc:w-full">
				<Sidebar>
					<SidebarHeader>
						<span className="wwc:px-2 wwc:text-sm wwc:font-semibold">Acme Co.</span>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Platform</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{NAV.map((item) => (
										<SidebarMenuItem key={item.id}>
											<SidebarMenuButton isActive={item.active}>
												<item.icon />
												<span>{item.label}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>
						<span className="wwc:px-2 wwc:text-xs wwc:text-muted-foreground">v1.0.0</span>
					</SidebarFooter>
				</Sidebar>
				<main className="wwc:flex wwc:flex-1 wwc:items-center wwc:gap-3 wwc:p-6">
					<SidebarTrigger />
					<span className="wwc:text-sm wwc:text-muted-foreground">
						Main content — use the trigger to collapse the sidebar.
					</span>
				</main>
			</div>
		</SidebarProvider>
	),
};
