import {
	Cloud,
	CreditCard,
	Github,
	Keyboard,
	LifeBuoy,
	LogOut,
	Plus,
	Settings,
	User,
	UserPlus,
	Users,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Dropdown Menu</h1>
					<CopyButton
						value="Dropdown Menu"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Displays a menu to the user — such as a set of actions or functions — triggered by a button.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Dropdown Menu - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">Open Menu</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="wwc:w-56">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Profile</span>
									<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<CreditCard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Billing</span>
									<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Settings</span>
									<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Keyboard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Keyboard shortcuts</span>
									<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<Users className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Team</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<UserPlus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Invite users</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Plus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>New Team</span>
									<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<Github className="wwc:mr-2 wwc:h-4 wwc:w-4" />
								<span>GitHub</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<LifeBuoy className="wwc:mr-2 wwc:h-4 wwc:w-4" />
								<span>Support</span>
							</DropdownMenuItem>
							<DropdownMenuItem disabled>
								<Cloud className="wwc:mr-2 wwc:h-4 wwc:w-4" />
								<span>API</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<LogOut className="wwc:mr-2 wwc:h-4 wwc:w-4" />
								<span>Log out</span>
								<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Dropdown Menu - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Built on Radix UI DropdownMenu primitives.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Component</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "DropdownMenuContent", type: "", def: "", desc: "—", component: true},
									{prop: "sideOffset", type: "number", def: "4", desc: "Distance in px from the trigger."},
									{
										prop: "align",
										type: '"start" | "center" | "end"',
										def: '"start"',
										desc: "Preferred alignment against the trigger.",
									},
									{prop: "DropdownMenuItem", type: "", def: "", desc: "—", component: true},
									{
										prop: "inset",
										type: "boolean",
										def: "false",
										desc: "Adds left padding to align with items that have icons.",
									},
									{prop: "DropdownMenuSubTrigger", type: "", def: "", desc: "—", component: true},
									{prop: "inset", type: "boolean", def: "false", desc: "Adds left padding for icon alignment."},
									{prop: "DropdownMenuLabel", type: "", def: "", desc: "—", component: true},
									{prop: "inset", type: "boolean", def: "false", desc: "Adds left padding for icon alignment."},
									{prop: "DropdownMenuCheckboxItem", type: "", def: "", desc: "—", component: true},
									{prop: "checked", type: "boolean", def: "—", desc: "Controlled checked state."},
								].map((row, i) => (
									<tr key={`${row.prop}-${i}`} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										{row.component ? (
											<td colSpan={5} className="wwc:py-3 wwc:font-mono wwc:text-primary wwc:font-semibold">
												{row.prop}
											</td>
										) : (
											<>
												<td className="wwc:py-3 wwc:pr-4" />
												<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
													{row.prop}
												</td>
												<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
												<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
												<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
											</>
										)}
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
							value="Dropdown Menu - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
