/**
 * Show keyboard shortcuts for common actions.
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

export function ShortcutsDo() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						Save <MenubarShortcut>⌘S</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Save As... <MenubarShortcut>⇧⌘S</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						Export <MenubarShortcut>⌘E</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
