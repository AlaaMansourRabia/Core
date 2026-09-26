/**
 * Avoid placing destructive actions inline without distinction.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Button} from "@corensystem/coren-ui/button";

export function DestructiveDont() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Actions</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Edit</DropdownMenuItem>
				<DropdownMenuItem>Delete</DropdownMenuItem>
				<DropdownMenuItem>Duplicate</DropdownMenuItem>
				{/* Delete looks the same as other items */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
