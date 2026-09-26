/**
 * Avoid unorganized flat lists of many items.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Button} from "@corensystem/coren-ui/button";

export function GroupingDont() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Actions</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Cut</DropdownMenuItem>
				<DropdownMenuItem>Delete</DropdownMenuItem>
				<DropdownMenuItem>Copy</DropdownMenuItem>
				<DropdownMenuItem>Undo</DropdownMenuItem>
				<DropdownMenuItem>Paste</DropdownMenuItem>
				<DropdownMenuItem>Redo</DropdownMenuItem>
				<DropdownMenuItem>Select All</DropdownMenuItem>
				{/* Random order makes scanning difficult */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
