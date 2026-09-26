import {Button} from "@corensystem/coren-ui/button";
/**
 * Visually distinguish destructive actions.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Trash2} from "lucide-react";

export function DestructiveDo() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Actions</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Edit</DropdownMenuItem>
				<DropdownMenuItem>Duplicate</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="wwc:text-destructive">
					<Trash2 className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
