import {Button} from "@corensystem/coren-ui/button";
/**
 * Group related menu items logically.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";

export function GroupingDo() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Edit</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Clipboard</DropdownMenuLabel>
				<DropdownMenuItem>Cut</DropdownMenuItem>
				<DropdownMenuItem>Copy</DropdownMenuItem>
				<DropdownMenuItem>Paste</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel>History</DropdownMenuLabel>
				<DropdownMenuItem>Undo</DropdownMenuItem>
				<DropdownMenuItem>Redo</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
