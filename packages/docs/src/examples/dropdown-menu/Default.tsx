/**
 * Basic dropdown menu with actions.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>New File</DropdownMenuItem>
				<DropdownMenuItem>Open</DropdownMenuItem>
				<DropdownMenuItem>Save</DropdownMenuItem>
				<DropdownMenuItem>Export</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
