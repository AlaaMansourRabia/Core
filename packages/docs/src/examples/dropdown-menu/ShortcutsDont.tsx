/**
 * Avoid hiding keyboard shortcuts from power users.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Button} from "@corensystem/coren-ui/button";

export function ShortcutsDont() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">File</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>New</DropdownMenuItem>
				<DropdownMenuItem>Open</DropdownMenuItem>
				<DropdownMenuItem>Save</DropdownMenuItem>
				{/* No shortcuts shown - users don't know ⌘S works */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
