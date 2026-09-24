/**
 * Avoid inconsistent or missing icons.
 */
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@corensystem/coren-ui/command";
import {Home, Star} from "lucide-react";

export function IconsDont() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Navigate to..." />
			<CommandList>
				<CommandGroup heading="Pages">
					<CommandItem>
						<Home className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Home
					</CommandItem>
					{/* No icon - inconsistent */}
					<CommandItem>
						Documents
					</CommandItem>
					<CommandItem>
						<Star className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						{/* Star icon for Projects - not intuitive */}
						Projects
					</CommandItem>
					{/* No icon */}
					<CommandItem>
						Search
					</CommandItem>
					{/* No icon */}
					<CommandItem>
						Notifications
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
