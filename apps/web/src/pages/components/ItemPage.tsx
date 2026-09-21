import {Bell, ChevronRight, Lock, Mail, Settings, User} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function ItemPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Item</h1>
					<CopyButton
						value="Item"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A versatile list item component for menus, settings, and navigation.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Basic Items</CardTitle>
						<CopyButton
							value="Item - Basic Items"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Simple list items with icon and label.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-md wwc:rounded-lg wwc:border wwc:divide-y">
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
							<User className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
							<span className="wwc:flex-1">Profile</span>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
							<Settings className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
							<span className="wwc:flex-1">Settings</span>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
							<Bell className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
							<span className="wwc:flex-1">Notifications</span>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Description</CardTitle>
						<CopyButton
							value="Item - With Description"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Items with title and description text.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-md wwc:rounded-lg wwc:border wwc:divide-y">
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
							<Mail className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
							<div className="wwc:flex-1">
								<p className="wwc:font-medium">Email</p>
								<p className="wwc:text-sm wwc:text-muted-foreground">Manage your email preferences</p>
							</div>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
							<Lock className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
							<div className="wwc:flex-1">
								<p className="wwc:font-medium">Security</p>
								<p className="wwc:text-sm wwc:text-muted-foreground">Update your password and security settings</p>
							</div>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Badge</CardTitle>
						<CopyButton
							value="Item - With Badge"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Items with notification badges.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-md wwc:rounded-lg wwc:border wwc:divide-y">
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
							<Bell className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
							<span className="wwc:flex-1">Notifications</span>
							<span className="wwc:rounded-full wwc:bg-primary wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:text-primary-foreground">
								3
							</span>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
							<Mail className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
							<span className="wwc:flex-1">Messages</span>
							<span className="wwc:rounded-full wwc:bg-destructive wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:text-destructive-foreground">
								12
							</span>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Item - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
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
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes for the item container."},
									{prop: "children", type: "ReactNode", def: "-", desc: "Content rendered inside the item."},
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

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Item - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { ChevronRight, User, Mail } from "lucide-react"

// Basic item
<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
  <User className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
  <span className="wwc:flex-1">Profile</span>
  <ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
</div>

// With description
<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4 wwc:hover:bg-muted/50 wwc:cursor-pointer">
  <Mail className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
  <div className="wwc:flex-1">
    <p className="wwc:font-medium">Email</p>
    <p className="wwc:text-sm wwc:text-muted-foreground">Manage preferences</p>
  </div>
  <ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
</div>

// With badge
<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-4">
  <Bell className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" />
  <span className="wwc:flex-1">Notifications</span>
  <span className="wwc:rounded-full wwc:bg-primary wwc:px-2 wwc:py-0.5 wwc:text-xs">3</span>
  <ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
</div>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
