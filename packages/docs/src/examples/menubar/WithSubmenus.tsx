/**
 * Menubar with nested submenus.
 */
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";

export function WithSubmenus() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>Insert</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>Text</MenubarItem>
					<MenubarSub>
						<MenubarSubTrigger>Shape</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>Rectangle</MenubarItem>
							<MenubarItem>Circle</MenubarItem>
							<MenubarItem>Triangle</MenubarItem>
							<MenubarItem>Line</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarSub>
						<MenubarSubTrigger>Media</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>Image</MenubarItem>
							<MenubarItem>Video</MenubarItem>
							<MenubarItem>Audio</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarItem>Table</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
