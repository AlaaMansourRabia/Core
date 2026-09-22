import type {Meta, StoryObj} from "storybook/internal/types";

import {AppShell, AppShellHeader, AppShellSidebar, AppShellMain, AppShellFooter} from "@corensystem/core-ui/app-shell";
import {Button} from "@corensystem/core-ui/button";
import {Input} from "@corensystem/core-ui/input";
import {Home, Settings, Users, FileText, Bell, Search, Menu} from "lucide-react";

const meta = {
	title: "Components/Primitives/AppShell",
	component: AppShell,
	tags: ["autodocs"],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const NavItem = ({icon: Icon, label, active = false}: {icon: typeof Home; label: string; active?: boolean}) => (
	<button
		className={`wwc:flex wwc:w-full wwc:items-center wwc:gap-3 wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:transition-colors ${
			active ? "wwc:bg-accent wwc:text-accent-foreground" : "wwc:text-muted-foreground hover:wwc:bg-accent/50"
		}`}
	>
		<Icon className="wwc:h-4 wwc:w-4" />
		{label}
	</button>
);

export const Default: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<AppShell
				header={
					<AppShellHeader>
						<Button variant="ghost" size="sm" className="wwc:h-8 wwc:w-8 wwc:p-0">
							<Menu className="wwc:h-4 wwc:w-4" />
						</Button>
						<span className="wwc:font-semibold">My Application</span>
						<div className="wwc:flex-1" />
						<div className="wwc:relative wwc:w-64">
							<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							<Input placeholder="Search..." className="wwc:pl-8 wwc:h-8" />
						</div>
						<Button variant="ghost" size="sm" className="wwc:h-8 wwc:w-8 wwc:p-0">
							<Bell className="wwc:h-4 wwc:w-4" />
						</Button>
					</AppShellHeader>
				}
				sidebar={
					<AppShellSidebar>
						<div className="wwc:space-y-1">
							<NavItem icon={Home} label="Dashboard" active />
							<NavItem icon={Users} label="Users" />
							<NavItem icon={FileText} label="Documents" />
							<NavItem icon={Settings} label="Settings" />
						</div>
					</AppShellSidebar>
				}
			>
				<AppShellMain>
					<h1 className="wwc:text-2xl wwc:font-bold wwc:mb-4">Dashboard</h1>
					<p className="wwc:text-muted-foreground">Welcome to your application dashboard.</p>
				</AppShellMain>
			</AppShell>
		</div>
	),
};

export const WithFooter: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<AppShell
				header={
					<AppShellHeader>
						<span className="wwc:font-semibold">My Application</span>
					</AppShellHeader>
				}
				sidebar={
					<AppShellSidebar>
						<div className="wwc:space-y-1">
							<NavItem icon={Home} label="Dashboard" active />
							<NavItem icon={Settings} label="Settings" />
						</div>
					</AppShellSidebar>
				}
				footer={
					<AppShellFooter>
						<span className="wwc:text-sm wwc:text-muted-foreground">© 2024 My Company</span>
					</AppShellFooter>
				}
			>
				<AppShellMain>
					<h1 className="wwc:text-2xl wwc:font-bold wwc:mb-4">Main Content</h1>
					<p className="wwc:text-muted-foreground">Content goes here.</p>
				</AppShellMain>
			</AppShell>
		</div>
	),
};

export const RightSidebar: Story = {
	render: () => (
		<div className="wwc:h-[600px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<AppShell
				sidebarPosition="right"
				header={
					<AppShellHeader>
						<span className="wwc:font-semibold">My Application</span>
					</AppShellHeader>
				}
				sidebar={
					<AppShellSidebar>
						<h3 className="wwc:font-semibold wwc:mb-4">Details</h3>
						<p className="wwc:text-sm wwc:text-muted-foreground">Sidebar on the right side.</p>
					</AppShellSidebar>
				}
			>
				<AppShellMain>
					<h1 className="wwc:text-2xl wwc:font-bold wwc:mb-4">Main Content</h1>
					<p className="wwc:text-muted-foreground">Content with right sidebar.</p>
				</AppShellMain>
			</AppShell>
		</div>
	),
};

export const NoSidebar: Story = {
	render: () => (
		<div className="wwc:h-[400px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<AppShell
				header={
					<AppShellHeader>
						<span className="wwc:font-semibold">Simple Layout</span>
						<div className="wwc:flex-1" />
						<Button size="sm">Action</Button>
					</AppShellHeader>
				}
			>
				<AppShellMain>
					<h1 className="wwc:text-2xl wwc:font-bold wwc:mb-4">Full Width Content</h1>
					<p className="wwc:text-muted-foreground">Layout without sidebar for simpler pages.</p>
				</AppShellMain>
			</AppShell>
		</div>
	),
};
