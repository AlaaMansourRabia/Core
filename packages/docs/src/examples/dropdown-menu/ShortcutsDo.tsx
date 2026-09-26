import {Button} from "@corensystem/coren-ui/button";
/**
 * Show keyboard shortcuts for common actions.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";

export function ShortcutsDo() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">File</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					New
					<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					Open
					<DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					Save
					<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
