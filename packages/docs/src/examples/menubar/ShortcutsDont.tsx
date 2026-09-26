/**
 * Avoid hiding shortcuts that users need to discover.
 */
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";

export function ShortcutsDont() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					{/* No shortcuts shown - users can't discover them */}
					<MenubarItem>Save</MenubarItem>
					<MenubarItem>Save As...</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Export</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
