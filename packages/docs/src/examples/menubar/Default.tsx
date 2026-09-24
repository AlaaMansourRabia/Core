/**
 * Basic menubar with common actions.
 */
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";

export function Default() {
	return (
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
					<MenubarSeparator />
					<MenubarItem>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						Print <MenubarShortcut>⌘P</MenubarShortcut>
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
					<MenubarItem>
						Cut <MenubarShortcut>⌘X</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Copy <MenubarShortcut>⌘C</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Paste <MenubarShortcut>⌘V</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>Reload</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Toggle Fullscreen</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
