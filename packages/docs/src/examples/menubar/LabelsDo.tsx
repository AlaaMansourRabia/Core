/**
 * Use clear, action-oriented labels.
 */
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";

export function LabelsDo() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>Create New Document</MenubarItem>
					<MenubarItem>Open Existing...</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Save Document</MenubarItem>
					<MenubarItem>Save As New Copy...</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Export to PDF</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
