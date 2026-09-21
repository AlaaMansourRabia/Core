import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {CopyButton} from "@/components/ui/copy-button";

export function ContextMenuPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Context Menu</h1>
					<CopyButton
						value="Context Menu"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Displays a menu to the user — such as a set of actions or functions — triggered by a right click.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Context Menu - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ContextMenu>
						<ContextMenuTrigger className="wwc:flex wwc:h-[150px] wwc:w-[300px] wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
							Right click here
						</ContextMenuTrigger>
						<ContextMenuContent className="wwc:w-64">
							<ContextMenuItem inset>
								Back
								<ContextMenuShortcut>⌘[</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuItem inset disabled>
								Forward
								<ContextMenuShortcut>⌘]</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuItem inset>
								Reload
								<ContextMenuShortcut>⌘R</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuSub>
								<ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
								<ContextMenuSubContent className="wwc:w-48">
									<ContextMenuItem>
										Save Page As...
										<ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
									</ContextMenuItem>
									<ContextMenuItem>Create Shortcut...</ContextMenuItem>
									<ContextMenuItem>Name Window...</ContextMenuItem>
									<ContextMenuSeparator />
									<ContextMenuItem>Developer Tools</ContextMenuItem>
								</ContextMenuSubContent>
							</ContextMenuSub>
							<ContextMenuSeparator />
							<ContextMenuCheckboxItem checked>
								Show Bookmarks Bar
								<ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
							</ContextMenuCheckboxItem>
							<ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
							<ContextMenuSeparator />
							<ContextMenuRadioGroup value="pedro">
								<ContextMenuLabel inset>People</ContextMenuLabel>
								<ContextMenuSeparator />
								<ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
								<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
							</ContextMenuRadioGroup>
						</ContextMenuContent>
					</ContextMenu>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Context Menu - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends Radix ContextMenuPrimitive props. Key sub-component props listed below.
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
										prop: "onOpenChange",
										type: "(open: boolean) => void",
										def: "—",
										desc: "Callback when the context menu open state changes (ContextMenu).",
									},
									{
										prop: "inset",
										type: "boolean",
										def: "false",
										desc: "Adds left padding for alignment with icons (ContextMenuItem, ContextMenuSubTrigger, ContextMenuLabel).",
									},
									{
										prop: "checked",
										type: "boolean",
										def: "—",
										desc: "The controlled checked state (ContextMenuCheckboxItem).",
									},
									{
										prop: "onCheckedChange",
										type: "(checked: boolean) => void",
										def: "—",
										desc: "Callback when the checked state changes (ContextMenuCheckboxItem).",
									},
									{
										prop: "value",
										type: "string",
										def: "—",
										desc: "The value of the radio item (ContextMenuRadioItem).",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the menu item is disabled."},
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
							value="Context Menu - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

<ContextMenu>
  <ContextMenuTrigger>Right click</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Profile</ContextMenuItem>
    <ContextMenuItem>Billing</ContextMenuItem>
    <ContextMenuItem>Settings</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
