import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "@/components/ui/menubar";

export function MenubarPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Menubar</h1>
					<CopyButton
						value="Menubar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">A visually persistent menu common in desktop applications.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Menubar - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Menubar>
						<MenubarMenu>
							<MenubarTrigger>File</MenubarTrigger>
							<MenubarContent>
								<MenubarItem>
									New Tab <MenubarShortcut>⌘T</MenubarShortcut>
								</MenubarItem>
								<MenubarItem>
									New Window <MenubarShortcut>⌘N</MenubarShortcut>
								</MenubarItem>
								<MenubarItem disabled>New Incognito Window</MenubarItem>
								<MenubarSeparator />
								<MenubarSub>
									<MenubarSubTrigger>Share</MenubarSubTrigger>
									<MenubarSubContent>
										<MenubarItem>Email link</MenubarItem>
										<MenubarItem>Messages</MenubarItem>
										<MenubarItem>Notes</MenubarItem>
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSeparator />
								<MenubarItem>
									Print... <MenubarShortcut>⌘P</MenubarShortcut>
								</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
						<MenubarMenu>
							<MenubarTrigger>Edit</MenubarTrigger>
							<MenubarContent>
								<MenubarItem>
									Undo <MenubarShortcut>⌘Z</MenubarShortcut>
								</MenubarItem>
								<MenubarItem>
									Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
								</MenubarItem>
								<MenubarSeparator />
								<MenubarSub>
									<MenubarSubTrigger>Find</MenubarSubTrigger>
									<MenubarSubContent>
										<MenubarItem>Search the web</MenubarItem>
										<MenubarSeparator />
										<MenubarItem>Find...</MenubarItem>
										<MenubarItem>Find Next</MenubarItem>
										<MenubarItem>Find Previous</MenubarItem>
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSeparator />
								<MenubarItem>Cut</MenubarItem>
								<MenubarItem>Copy</MenubarItem>
								<MenubarItem>Paste</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
						<MenubarMenu>
							<MenubarTrigger>View</MenubarTrigger>
							<MenubarContent>
								<MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
								<MenubarCheckboxItem checked>Always Show Full URLs</MenubarCheckboxItem>
								<MenubarSeparator />
								<MenubarItem inset>
									Reload <MenubarShortcut>⌘R</MenubarShortcut>
								</MenubarItem>
								<MenubarItem disabled inset>
									Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
								</MenubarItem>
								<MenubarSeparator />
								<MenubarItem inset>Toggle Fullscreen</MenubarItem>
								<MenubarSeparator />
								<MenubarItem inset>Hide Sidebar</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
						<MenubarMenu>
							<MenubarTrigger>Profiles</MenubarTrigger>
							<MenubarContent>
								<MenubarRadioGroup value="benoit">
									<MenubarRadioItem value="andy">Andy</MenubarRadioItem>
									<MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
									<MenubarRadioItem value="luis">Luis</MenubarRadioItem>
								</MenubarRadioGroup>
								<MenubarSeparator />
								<MenubarItem inset>Edit...</MenubarItem>
								<MenubarSeparator />
								<MenubarItem inset>Add Profile...</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
					</Menubar>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Menubar - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes via Radix Menubar.
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
										prop: "inset",
										type: "boolean",
										def: "false",
										desc: "Adds left padding for items without icons (MenubarItem, MenubarSubTrigger, MenubarLabel).",
									},
									{prop: "checked", type: "boolean", def: "-", desc: "Controlled checked state (MenubarCheckboxItem)."},
									{prop: "value", type: "string", def: "-", desc: "Value for radio items (MenubarRadioItem)."},
									{
										prop: "align",
										type: "'start' | 'center' | 'end'",
										def: "'start'",
										desc: "Alignment of the content relative to the trigger (MenubarContent).",
									},
									{
										prop: "alignOffset",
										type: "number",
										def: "-4",
										desc: "Offset from the aligned edge in pixels (MenubarContent).",
									},
									{
										prop: "sideOffset",
										type: "number",
										def: "8",
										desc: "Offset from the trigger in pixels (MenubarContent).",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Disables the menu item (MenubarItem)."},
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
							value="Menubar - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Tab</MenubarItem>
      <MenubarItem>New Window</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
