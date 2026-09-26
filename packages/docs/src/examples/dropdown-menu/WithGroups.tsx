import {Button} from "@corensystem/coren-ui/button";
/**
 * Dropdown menu with grouped items and separators.
 */
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {User, Settings, LogOut} from "lucide-react";

export function WithGroups() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Account</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="wwc:w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<LogOut className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
