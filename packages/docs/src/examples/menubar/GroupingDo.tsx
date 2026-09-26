/**
 * Group related menu items with separators.
 */
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";

export function GroupingDo() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					{/* Undo/Redo group */}
					<MenubarItem>Undo</MenubarItem>
					<MenubarItem>Redo</MenubarItem>
					<MenubarSeparator />
					{/* Clipboard group */}
					<MenubarItem>Cut</MenubarItem>
					<MenubarItem>Copy</MenubarItem>
					<MenubarItem>Paste</MenubarItem>
					<MenubarSeparator />
					{/* Selection group */}
					<MenubarItem>Select All</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
