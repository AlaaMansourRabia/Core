import {BarChart, Calendar, FileText, HelpCircle, Home, Mail, Settings, Users} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {CoreAppSidebar} from "@/components/ui/navigation/core-app-sidebar";

export function SidebarPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Sidebar</h1>
					<CopyButton
						value="Sidebar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A composable sidebar component for navigation and app layouts.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>App Sidebar</CardTitle>
						<CopyButton
							value="Sidebar - App Sidebar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Full-featured app sidebar with org switcher, global search, expandable nav, profile panel, and
						notifications.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:gap-8 wwc:flex-wrap">
						<CoreAppSidebar />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Basic Sidebar</CardTitle>
						<CopyButton
							value="Sidebar - Basic Sidebar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Full-width sidebar with navigation items.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:h-[520px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
						<div className="wwc:w-64 wwc:border-r wwc:bg-sidebar wwc:flex wwc:flex-col">
							<div className="wwc:p-4 wwc:border-b">
								<h3 className="wwc:font-semibold">Application</h3>
							</div>
							<nav className="wwc:flex-1 wwc:p-2 wwc:space-y-1">
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:bg-sidebar-accent wwc:text-sidebar-accent-foreground"
								>
									<Home className="wwc:h-4 wwc:w-4" />
									Dashboard
								</a>
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent wwc:text-sidebar-foreground"
								>
									<Users className="wwc:h-4 wwc:w-4" />
									Users
								</a>
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent wwc:text-sidebar-foreground"
								>
									<Mail className="wwc:h-4 wwc:w-4" />
									Messages
								</a>
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent wwc:text-sidebar-foreground"
								>
									<Calendar className="wwc:h-4 wwc:w-4" />
									Calendar
								</a>
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent wwc:text-sidebar-foreground"
								>
									<FileText className="wwc:h-4 wwc:w-4" />
									Documents
								</a>
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent wwc:text-sidebar-foreground"
								>
									<BarChart className="wwc:h-4 wwc:w-4" />
									Analytics
								</a>
							</nav>
							<div className="wwc:p-2 wwc:border-t">
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent wwc:text-sidebar-foreground"
								>
									<Settings className="wwc:h-4 wwc:w-4" />
									Settings
								</a>
								<a
									href="#"
									className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent wwc:text-sidebar-foreground"
								>
									<HelpCircle className="wwc:h-4 wwc:w-4" />
									Help
								</a>
							</div>
						</div>
						<div className="wwc:flex-1 wwc:p-6 wwc:bg-background">
							<p className="wwc:text-muted-foreground">Main content area</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Collapsed Sidebar</CardTitle>
						<CopyButton
							value="Sidebar - Collapsed Sidebar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Icon-only sidebar for compact layouts.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:h-[380px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
						<div className="wwc:w-16 wwc:border-r wwc:bg-sidebar wwc:flex wwc:flex-col wwc:items-center">
							<div className="wwc:p-4 wwc:border-b wwc:w-full wwc:flex wwc:justify-center">
								<div className="wwc:h-8 wwc:w-8 wwc:rounded-lg wwc:bg-primary" />
							</div>
							<nav className="wwc:flex-1 wwc:p-2 wwc:space-y-1 wwc:flex wwc:flex-col wwc:items-center">
								<a href="#" className="wwc:p-3 wwc:rounded-lg wwc:bg-sidebar-accent">
									<Home className="wwc:h-4 wwc:w-4" />
								</a>
								<a href="#" className="wwc:p-3 wwc:rounded-lg wwc:hover:bg-sidebar-accent">
									<Users className="wwc:h-4 wwc:w-4" />
								</a>
								<a href="#" className="wwc:p-3 wwc:rounded-lg wwc:hover:bg-sidebar-accent">
									<Mail className="wwc:h-4 wwc:w-4" />
								</a>
								<a href="#" className="wwc:p-3 wwc:rounded-lg wwc:hover:bg-sidebar-accent">
									<Calendar className="wwc:h-4 wwc:w-4" />
								</a>
							</nav>
							<div className="wwc:p-2 wwc:border-t wwc:w-full wwc:flex wwc:flex-col wwc:items-center">
								<a href="#" className="wwc:p-3 wwc:rounded-lg wwc:hover:bg-sidebar-accent">
									<Settings className="wwc:h-4 wwc:w-4" />
								</a>
							</div>
						</div>
						<div className="wwc:flex-1 wwc:p-6 wwc:bg-background">
							<p className="wwc:text-muted-foreground">Main content area</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Sidebar - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Home, Settings, Users } from "lucide-react"

// Basic sidebar structure
<div className="wwc:w-64 wwc:border-r wwc:bg-sidebar wwc:flex wwc:flex-col">
  <div className="wwc:p-4 wwc:border-b">
    <h3 className="wwc:font-semibold">Application</h3>
  </div>
  <nav className="wwc:flex-1 wwc:p-2 wwc:space-y-1">
    <a className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:bg-sidebar-accent">
      <Home className="wwc:h-4 wwc:w-4" />
      Dashboard
    </a>
    <a className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent">
      <Users className="wwc:h-4 wwc:w-4" />
      Users
    </a>
  </nav>
  <div className="wwc:p-2 wwc:border-t">
    <a className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:rounded-lg wwc:hover:bg-sidebar-accent">
      <Settings className="wwc:h-4 wwc:w-4" />
      Settings
    </a>
  </div>
</div>

// Collapsed sidebar (icon only)
<div className="wwc:w-16 wwc:border-r wwc:bg-sidebar wwc:flex wwc:flex-col wwc:items-center">
  <nav className="wwc:flex-1 wwc:p-2 wwc:space-y-1 wwc:flex wwc:flex-col wwc:items-center">
    <a className="wwc:p-3 wwc:rounded-lg wwc:bg-sidebar-accent">
      <Home className="wwc:h-4 wwc:w-4" />
    </a>
  </nav>
</div>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
