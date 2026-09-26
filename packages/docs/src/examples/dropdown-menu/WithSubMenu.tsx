import {Button} from "@corensystem/coren-ui/button";
/**
 * Dropdown menu with nested submenus.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";

export function WithSubMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Options</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>New Tab</DropdownMenuItem>
				<DropdownMenuItem>New Window</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>Save Page As...</DropdownMenuItem>
						<DropdownMenuItem>Create Shortcut</DropdownMenuItem>
						<DropdownMenuItem>Developer Tools</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
