/**
 * Avoid vague or technical menu labels.
 */
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";

export function LabelsDont() {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					{/* Vague labels */}
					<MenubarItem>New</MenubarItem>
					<MenubarItem>Open</MenubarItem>
					<MenubarSeparator />
					{/* Technical jargon */}
					<MenubarItem>Persist</MenubarItem>
					<MenubarItem>Clone to Disk</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Serialize Output</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
