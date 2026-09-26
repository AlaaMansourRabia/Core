import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic dropdown menu with actions.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";

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
