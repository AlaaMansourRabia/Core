/**
 * Menubar with disabled items.
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

export function Disabled() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					<MenubarItem disabled>
						Undo <MenubarShortcut>⌘Z</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>
						Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem disabled>
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
		</Menubar>
	);
}
