/**
 * Avoid long menus without logical grouping.
 */
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";

export function GroupingDont() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					{/* No separators - hard to scan */}
					<MenubarItem>Undo</MenubarItem>
					<MenubarItem>Redo</MenubarItem>
					<MenubarItem>Cut</MenubarItem>
					<MenubarItem>Copy</MenubarItem>
					<MenubarItem>Paste</MenubarItem>
					<MenubarItem>Select All</MenubarItem>
					<MenubarItem>Find</MenubarItem>
					<MenubarItem>Replace</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
