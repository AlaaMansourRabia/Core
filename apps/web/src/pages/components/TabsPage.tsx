import {
	Activity,
	BarChart3,
	Bell,
	Code,
	CreditCard,
	FileText,
	Folder,
	LifeBuoy,
	Lock,
	Mail,
	Package,
	Settings,
	Sparkles,
	User,
} from "lucide-react";
import * as React from "react";

import {BrowserTabs, type BrowserTabItem} from "@/components/ui/browser-tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface BrowserTabDemoItem extends BrowserTabItem {
	content: React.ReactNode;
}

function BrowserTabsDemo({tabs: initialTabs, closeable = true}: {tabs: BrowserTabDemoItem[]; closeable?: boolean}) {
	const [tabs, setTabs] = React.useState(initialTabs);
	const [activeId, setActiveId] = React.useState<string | undefined>(initialTabs[0]?.id);

	const handleClose = (id: string) => {
		const idx = tabs.findIndex((t) => t.id === id);
		const next = tabs.filter((t) => t.id !== id);
		setTabs(next);
		if (activeId === id) {
			const fallback = next[Math.max(0, idx - 1)];
			setActiveId(fallback?.id);
		}
	};

	const active = tabs.find((t) => t.id === activeId);
	const stripTabs: BrowserTabItem[] = tabs.map(({id, label, icon, disabled}) => ({id, label, icon, disabled}));

	return (
		<div className="w-full">
			<BrowserTabs
				tabs={stripTabs}
				activeId={activeId}
				onActiveChange={setActiveId}
				onTabClose={closeable ? handleClose : undefined}
				closeable={closeable}
				className="rounded-t-lg"
			/>
			<div className="rounded-b-lg border border-t-0 border-border bg-background p-6 text-sm">
				{active ? active.content : <p className="text-muted-foreground">No tabs open.</p>}
			</div>
		</div>
	);
}

export function TabsPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Tabs</h1>
					<CopyButton
						value="Tabs"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A set of layered sections of content—known as tab panels—that are displayed one at a time.
				</p>
			</div>

			{/* Default - Text Only */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Tabs - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Text-only tabs.</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="account" className="wwc:w-full">
						<TabsList>
							<TabsTrigger value="account">Account</TabsTrigger>
							<TabsTrigger value="password">Password</TabsTrigger>
							<TabsTrigger value="settings">Settings</TabsTrigger>
						</TabsList>
						<TabsContent value="account" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Account settings and information.</p>
						</TabsContent>
						<TabsContent value="password" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Change your password here.</p>
						</TabsContent>
						<TabsContent value="settings" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Other settings and preferences.</p>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Underline variant */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Underline</CardTitle>
						<CopyButton
							value="Tabs - Underline"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Text-only triggers with a full-width bottom strip and a thick underline on the active tab. Set{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">variant="underline"</code>{" "}
						on the root <code>Tabs</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs variant="underline" defaultValue="all" className="wwc:w-full">
						<TabsList>
							<TabsTrigger value="all">All integrations</TabsTrigger>
							<TabsTrigger value="support">Support</TabsTrigger>
							<TabsTrigger value="codebase">Codebase</TabsTrigger>
							<TabsTrigger value="product">Product</TabsTrigger>
						</TabsList>
						<TabsContent value="all" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Browse every available integration.</p>
						</TabsContent>
						<TabsContent value="support" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Helpdesk and ticketing tools.</p>
						</TabsContent>
						<TabsContent value="codebase" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Source control, code search, CI.</p>
						</TabsContent>
						<TabsContent value="product" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Roadmapping and analytics tools.</p>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Underline with icons */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Underline with Icons</CardTitle>
						<CopyButton
							value="Tabs - Underline with Icons"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Underline triggers with a leading icon. Use{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">display="icon-text"</code>{" "}
						and place the icon as the first child.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs variant="underline" defaultValue="all" className="wwc:w-full">
						<TabsList>
							<TabsTrigger value="all" display="icon-text">
								<Sparkles className="wwc:h-4 wwc:w-4" />
								All integrations
							</TabsTrigger>
							<TabsTrigger value="support" display="icon-text">
								<LifeBuoy className="wwc:h-4 wwc:w-4" />
								Support
							</TabsTrigger>
							<TabsTrigger value="codebase" display="icon-text">
								<Code className="wwc:h-4 wwc:w-4" />
								Codebase
							</TabsTrigger>
							<TabsTrigger value="product" display="icon-text">
								<Package className="wwc:h-4 wwc:w-4" />
								Product
							</TabsTrigger>
						</TabsList>
						<TabsContent value="all" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Browse every available integration.</p>
						</TabsContent>
						<TabsContent value="support" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Helpdesk and ticketing tools.</p>
						</TabsContent>
						<TabsContent value="codebase" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Source control, code search, CI.</p>
						</TabsContent>
						<TabsContent value="product" className="wwc:p-4">
							<p className="wwc:text-sm wwc:text-muted-foreground">Roadmapping and analytics tools.</p>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Sizes */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Sizes</CardTitle>
						<CopyButton
							value="Tabs - Sizes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Both variants accept{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">size</code> of{" "}
						<code>"sm"</code>, <code>"md"</code> (default), or <code>"lg"</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-8">
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Underline — Small</span>
							<Tabs variant="underline" size="sm" defaultValue="all">
								<TabsList>
									<TabsTrigger value="all">All integrations</TabsTrigger>
									<TabsTrigger value="support">Support</TabsTrigger>
									<TabsTrigger value="codebase">Codebase</TabsTrigger>
									<TabsTrigger value="product">Product</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Underline — Medium</span>
							<Tabs variant="underline" size="md" defaultValue="all">
								<TabsList>
									<TabsTrigger value="all">All integrations</TabsTrigger>
									<TabsTrigger value="support">Support</TabsTrigger>
									<TabsTrigger value="codebase">Codebase</TabsTrigger>
									<TabsTrigger value="product">Product</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Underline — Large</span>
							<Tabs variant="underline" size="lg" defaultValue="all">
								<TabsList>
									<TabsTrigger value="all">All integrations</TabsTrigger>
									<TabsTrigger value="support">Support</TabsTrigger>
									<TabsTrigger value="codebase">Codebase</TabsTrigger>
									<TabsTrigger value="product">Product</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Rounded — Small</span>
							<Tabs size="sm" defaultValue="account">
								<TabsList>
									<TabsTrigger value="account">Account</TabsTrigger>
									<TabsTrigger value="password">Password</TabsTrigger>
									<TabsTrigger value="settings">Settings</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Rounded — Medium</span>
							<Tabs size="md" defaultValue="account">
								<TabsList>
									<TabsTrigger value="account">Account</TabsTrigger>
									<TabsTrigger value="password">Password</TabsTrigger>
									<TabsTrigger value="settings">Settings</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Rounded — Large</span>
							<Tabs size="lg" defaultValue="account">
								<TabsList>
									<TabsTrigger value="account">Account</TabsTrigger>
									<TabsTrigger value="password">Password</TabsTrigger>
									<TabsTrigger value="settings">Settings</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Icon Only */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Icon Only</CardTitle>
						<CopyButton
							value="Tabs - Icon Only"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Compact tabs with icons only.</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="user" className="wwc:w-full">
						<TabsList>
							<TabsTrigger value="user" display="icon">
								<User className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
							<TabsTrigger value="settings" display="icon">
								<Settings className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
							<TabsTrigger value="security" display="icon">
								<Lock className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
							<TabsTrigger value="notifications" display="icon">
								<Bell className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
							<TabsTrigger value="billing" display="icon">
								<CreditCard className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
							<TabsTrigger value="email" display="icon">
								<Mail className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
						</TabsList>
						<TabsContent value="user" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>User profile settings.</p>
						</TabsContent>
						<TabsContent value="settings" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>General settings.</p>
						</TabsContent>
						<TabsContent value="security" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Security and privacy.</p>
						</TabsContent>
						<TabsContent value="notifications" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Notification preferences.</p>
						</TabsContent>
						<TabsContent value="billing" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Billing information.</p>
						</TabsContent>
						<TabsContent value="email" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Email settings.</p>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Icon with Text */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Icon with Text</CardTitle>
						<CopyButton
							value="Tabs - Icon with Text"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Tabs combining icons and text labels.</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="account" className="wwc:w-full">
						<TabsList>
							<TabsTrigger value="account" display="icon-text">
								<User className="wwc:h-4 wwc:w-4" />
								Account
							</TabsTrigger>
							<TabsTrigger value="security" display="icon-text">
								<Lock className="wwc:h-4 wwc:w-4" />
								Security
							</TabsTrigger>
							<TabsTrigger value="notifications" display="icon-text">
								<Bell className="wwc:h-4 wwc:w-4" />
								Notifications
							</TabsTrigger>
						</TabsList>
						<TabsContent value="account" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Account information and settings.</p>
						</TabsContent>
						<TabsContent value="security" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Security settings and two-factor authentication.</p>
						</TabsContent>
						<TabsContent value="notifications" className="wwc:p-4 wwc:border wwc:rounded-lg">
							<p>Manage your notification preferences.</p>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Browser-style Tabs */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Browser-style Tabs</CardTitle>
						<CopyButton
							value="Tabs - Browser-style Tabs"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Tabs with inverted (concave) bottom corners that flow seamlessly into the content panel below. Click the ×
						to close a tab.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<BrowserTabsDemo
						tabs={[
							{
								id: "dashboard",
								label: "Dashboard",
								icon: <BarChart3 className="h-3.5 w-3.5" />,
								content: (
									<div className="space-y-2">
										<h3 className="text-base font-semibold">Dashboard</h3>
										<p className="text-muted-foreground">
											Overview of your project performance, KPIs, and recent activity. The active tab and this content
											panel form a single connected white surface.
										</p>
									</div>
								),
							},
							{
								id: "analytics",
								label: "Analytics",
								icon: <Activity className="h-3.5 w-3.5" />,
								content: (
									<div className="space-y-2">
										<h3 className="text-base font-semibold">Analytics</h3>
										<p className="text-muted-foreground">Detailed metrics, trends, and breakdowns over time.</p>
									</div>
								),
							},
							{
								id: "files",
								label: "Files",
								icon: <Folder className="h-3.5 w-3.5" />,
								content: (
									<div className="space-y-2">
										<h3 className="text-base font-semibold">Files</h3>
										<p className="text-muted-foreground">Browse and manage project documents and assets.</p>
									</div>
								),
							},
							{
								id: "reports",
								label: "Reports",
								icon: <FileText className="h-3.5 w-3.5" />,
								content: (
									<div className="space-y-2">
										<h3 className="text-base font-semibold">Reports</h3>
										<p className="text-muted-foreground">Generated reports and export history.</p>
									</div>
								),
							},
							{
								id: "settings",
								label: "Settings",
								icon: <Settings className="h-3.5 w-3.5" />,
								disabled: true,
								content: (
									<div className="space-y-2">
										<h3 className="text-base font-semibold">Settings</h3>
										<p className="text-muted-foreground">Configuration options.</p>
									</div>
								),
							},
						]}
					/>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Tabs - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends Radix UI{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<Tabs>"}</code> HTML
						attributes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "defaultValue",
										type: "string",
										def: "-",
										desc: "The default active tab value (uncontrolled).",
									},
									{prop: "value", type: "string", def: "-", desc: "The controlled active tab value."},
									{
										prop: "onValueChange",
										type: "(value: string) => void",
										def: "-",
										desc: "Callback fired when the active tab changes.",
									},
									{
										prop: "TabsTrigger.display",
										type: '"text" | "icon" | "icon-text"',
										def: '"text"',
										desc: "Display mode for the tab trigger content.",
									},
									{prop: "TabsTrigger.value", type: "string", def: "-", desc: "Unique value identifying the tab."},
									{
										prop: "TabsContent.value",
										type: "string",
										def: "-",
										desc: "Value matching the trigger to display content for.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Tabs - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings } from "lucide-react"

// Text only (default)
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
  <TabsContent value="password">Password content</TabsContent>
</Tabs>

// Icon only
<Tabs defaultValue="user">
  <TabsList>
    <TabsTrigger value="user" display="icon">
      <User className="wwc:h-4 wwc:w-4" />
    </TabsTrigger>
    <TabsTrigger value="settings" display="icon">
      <Settings className="wwc:h-4 wwc:w-4" />
    </TabsTrigger>
  </TabsList>
</Tabs>

// Icon with text
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account" display="icon-text">
      <User className="wwc:h-4 wwc:w-4" />
      Account
    </TabsTrigger>
  </TabsList>
</Tabs>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
